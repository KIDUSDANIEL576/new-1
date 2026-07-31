// widget-snapshot — serves the couple's latest snapshot PNG to home-screen
// widgets. Native widgets can't run a Supabase auth session, so auth is a
// long-lived random token minted by the app (widget_tokens table, RLS-owned).
// verify_jwt is off by design: the token IS the credential.

import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const token = new URL(req.url).searchParams.get('token') ?? '';
    if (token.length < 20) return text('unauthorized', 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: t } = await admin
      .from('widget_tokens')
      .select('user_id')
      .eq('token', token)
      .maybeSingle();
    if (!t) return text('unauthorized', 401);

    const { data: m } = await admin
      .from('members')
      .select('couple_id')
      .eq('user_id', t.user_id)
      .maybeSingle();
    if (!m) return text('no couple yet', 404);

    const { data: blob } = await admin.storage
      .from('widgets')
      .download(`${m.couple_id}/snapshot.png`);
    if (!blob) return text('no snapshot yet', 404);

    return new Response(blob, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return text(e instanceof Error ? e.message : 'unknown', 500);
  }
});

function text(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } });
}
