// delete-account — erases the caller's account, for real.
//
// Required by App Store guideline 5.1.1(v): any app that lets you create an
// account must let you delete it from inside the app. This is that.
//
// What goes:  your login, your ink, your streak marks, your push + widget
//             tokens, your half of the couple.
// What stays: your partner's ink, their photos, and a paid Trace Forever —
//             the entitlement belongs to the couple, so whoever stays keeps it.
// Unless you were the last one, in which case the couple and everything inside
// it (canvases, strokes, photos, snapshot, entitlement) is deleted too.
//
// Deleting the auth user does NOT cascade to strokes or daily_marks — both are
// NO ACTION — so purge_user_data() has to run first or the delete fails on a
// foreign key. Verified against the live schema.
//
// Deploy with: supabase functions deploy delete-account

import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

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

    // Deliberate friction: the client sends back the exact word so a stray tap
    // three menus deep can't erase someone's account.
    const { confirm } = await req.json().catch(() => ({}));
    if (confirm !== 'DELETE') {
      return json({ error: 'confirmation required' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // clears everything that would block the auth delete, and tears down the
    // couple if this was the last member
    const { data: purge, error: purgeErr } = await admin.rpc('purge_user_data', {
      p_user: user.id,
    });
    if (purgeErr) return json({ error: 'could not clear account data' }, 500);

    const coupleDeleted = purge?.coupleDeleted === true;
    const coupleId = purge?.coupleId as string | null;

    // storage isn't covered by any foreign key — remove it by hand
    if (coupleDeleted && coupleId) {
      await removeAll(admin, 'couple-photos', coupleId);
      await admin.storage.from('widgets').remove([`${coupleId}/snapshot.png`]).catch(() => {});
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) return json({ error: 'could not delete the account' }, 500);

    return json({ deleted: true, coupleDeleted });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

/** Storage has no cascade — list the couple's folder and delete what's in it. */
async function removeAll(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string
): Promise<void> {
  try {
    const { data: files } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
    if (!files?.length) return;
    await admin.storage.from(bucket).remove(files.map((f) => `${prefix}/${f.name}`));
  } catch {
    // a leftover object is not a reason to fail the deletion the user asked for
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
