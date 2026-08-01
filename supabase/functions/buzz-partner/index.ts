// buzz-partner — makes the other phone ring, not just banner.
//
// Sent deliberately (a button press), unlike notify-partner which fires
// automatically on every stroke. So it gets a much shorter throttle — but it
// still gets one: this is an attention weapon pointed at someone you love, and
// the limit belongs on the server where the client can't argue with it.
//
// What this can and cannot do: iOS Critical Alerts (which pierce silent mode)
// need an Apple entitlement granted almost exclusively to medical/safety apps,
// and CallKit is contractually VoIP-only. So this is a high-priority push with
// a custom ring sound and a heavy vibration pattern. On a phone that isn't
// silenced it reads as ringing; on a silenced phone it respects the silence.
//
// Deploy with: supabase functions deploy buzz-partner

import { createClient } from 'npm:@supabase/supabase-js@2';

const THROTTLE_SECONDS = 120;

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { coupleId } = await req.json().catch(() => ({}));
    if (!coupleId) return json({ error: 'coupleId required' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: members } = await admin
      .from('members')
      .select('user_id, display_name')
      .eq('couple_id', coupleId);
    const me = members?.find((m) => m.user_id === user.id);
    const partner = members?.find((m) => m.user_id !== user.id);
    if (!me) return json({ error: 'not a member' }, 403);
    if (!partner) return json({ skipped: 'no partner yet' });

    // throttle per recipient, so both partners can't be ganged up on
    const since = new Date(Date.now() - THROTTLE_SECONDS * 1000).toISOString();
    const { data: recent } = await admin
      .from('buzz_log')
      .select('sent_at')
      .eq('recipient_id', partner.user_id)
      .gte('sent_at', since)
      .order('sent_at', { ascending: false })
      .limit(1);
    if (recent && recent.length > 0) {
      const elapsed = (Date.now() - new Date(recent[0].sent_at).getTime()) / 1000;
      return json({
        skipped: 'throttled',
        retryAfter: Math.max(1, Math.ceil(THROTTLE_SECONDS - elapsed)),
      });
    }

    const { data: tokenRow } = await admin
      .from('push_tokens')
      .select('token')
      .eq('user_id', partner.user_id)
      .maybeSingle();
    if (!tokenRow?.token) return json({ skipped: 'partner has no push token' });

    const name = me.display_name ?? 'Your person';
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: tokenRow.token,
        title: 'trace',
        body: `${name} is thinking about you ❤️`,
        sound: 'buzz.wav',       // bundled via the expo-notifications plugin
        channelId: 'buzz',       // high-importance channel created by the app
        priority: 'high',
        interruptionLevel: 'time-sensitive', // iOS 15+: surfaces through Focus
        data: { kind: 'buzz', coupleId },
      }),
    });
    if (!res.ok) return json({ error: 'expo push failed' }, 502);

    await admin.from('buzz_log').insert({
      couple_id: coupleId,
      sender_id: user.id,
      recipient_id: partner.user_id,
    });

    return json({ sent: true, cooldown: THROTTLE_SECONDS });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
