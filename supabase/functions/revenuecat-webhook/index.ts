// revenuecat-webhook — the only thing allowed to grant "Trace Forever".
//
// RevenueCat POSTs purchase events here. The entitlement is written against the
// buyer's COUPLE, not the buyer, so one $29.99 purchase unlocks both partners.
//
// verify_jwt is off by design: RevenueCat can't mint a Supabase JWT. The shared
// secret in the Authorization header IS the credential — set the same value in
// RevenueCat → Integrations → Webhooks → Authorization header, and as the
// REVENUECAT_WEBHOOK_SECRET function secret.
//
// Deploy with: supabase functions deploy revenuecat-webhook --no-verify-jwt

import { createClient } from 'npm:@supabase/supabase-js@2';

// RevenueCat entitlement identifier that means "this couple paid".
const ENTITLEMENT_ID = Deno.env.get('REVENUECAT_ENTITLEMENT_ID') ?? 'trace_forever';

const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'NON_RENEWING_PURCHASE', // one-time products land here
  'UNCANCELLATION',
  'TRANSFER',
]);
const REVOKE_EVENTS = new Set(['REFUND', 'EXPIRATION']);

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

    const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    if (!secret) return json({ error: 'webhook secret not configured' }, 500);
    if (!safeEqual(req.headers.get('Authorization') ?? '', secret)) {
      return json({ error: 'unauthorized' }, 401);
    }

    const body = await req.json().catch(() => null);
    const event = body?.event;
    if (!event?.type || !event?.id) return json({ error: 'malformed event' }, 400);

    const type: string = event.type;
    const grant = GRANT_EVENTS.has(type);
    const revoke = REVOKE_EVENTS.has(type);
    // Everything else (BILLING_ISSUE, SUBSCRIBER_ALIAS, TEST…) is a no-op we
    // still 200, so RevenueCat doesn't retry it forever.
    if (!grant && !revoke) return json({ ok: true, ignored: type });

    // Only act on our product. RevenueCat sends entitlement_ids on most events;
    // fall back to the product id when it doesn't.
    const entitlements: string[] = event.entitlement_ids ?? [];
    const matchesProduct =
      entitlements.includes(ENTITLEMENT_ID) ||
      String(event.product_id ?? '').includes(ENTITLEMENT_ID);
    if (!matchesProduct) return json({ ok: true, ignored: 'other product' });

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // The app sets RevenueCat's appUserID to the Supabase user id at sign-in.
    const userId = firstUuid([event.app_user_id, event.original_app_user_id]);
    if (!userId) return json({ ok: true, ignored: 'no supabase user id on event' });

    const { data: member } = await admin
      .from('members')
      .select('couple_id')
      .eq('user_id', userId)
      .maybeSingle();
    // Bought before pairing: 200 so RevenueCat stops retrying. The client
    // re-syncs entitlements after pairing via restore().
    if (!member) return json({ ok: true, deferred: 'user has no couple yet' });

    if (revoke) {
      await admin.rpc('revoke_entitlement', { p_couple_id: member.couple_id });
      return json({ ok: true, revoked: member.couple_id, event: type });
    }

    // Sandbox purchases unlock too (so you can test the paid paths end to end)
    // but are recorded as 'test' so real revenue stays distinguishable.
    const store =
      event.environment === 'SANDBOX'
        ? 'test'
        : event.store === 'APP_STORE'
          ? 'app_store'
          : event.store === 'PLAY_STORE'
            ? 'play_store'
            : 'promo';

    // rc_event_id is unique + the insert is ON CONFLICT DO NOTHING, so a
    // redelivered event is a no-op rather than a duplicate unlock.
    await admin.rpc('grant_entitlement', {
      p_couple_id: member.couple_id,
      p_store: store,
      p_product: event.product_id ?? 'trace_forever',
      p_purchased_by: userId,
      p_event_id: event.id,
    });

    return json({ ok: true, granted: member.couple_id, store, event: type });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// RevenueCat generates anonymous ids ($RCAnonymousID:…) before the app
// identifies the user — those are not ours.
function firstUuid(candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (typeof c === 'string' && UUID_RE.test(c)) return c;
  }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
