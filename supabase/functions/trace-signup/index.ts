// trace-signup — DEPRECATED. Both clients now call supabase.auth.signUp()
// directly, so that whether a confirmation email is required is decided by the
// project's Authentication → Providers → Email → "Confirm email" setting rather
// than by us.
//
// This endpoint used to pass `email_confirm: true`, which minted PRE-CONFIRMED
// accounts. That quietly made a mistyped address unrecoverable: the account
// worked, but no password-reset email could ever reach it, so a forgotten
// password meant a dead account with no way back in.
//
// It stays deployed only so that older cached web pages keep working. It no
// longer pre-confirms anything.
//
// Deploy with: supabase functions deploy trace-signup --no-verify-jwt

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let email = '';
  let password = '';
  try {
    const body = await req.json();
    email = String(body.email ?? '').trim().toLowerCase();
    password = String(body.password ?? '');
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return json({ error: 'invalid_email' }, 400);
  }
  if (password.length < 6 || password.length > 72) {
    return json({ error: 'invalid_password' }, 400);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // signUp, not admin.createUser: this respects the project's confirmation
  // setting and sends the confirmation email when one is required. The admin
  // path does neither.
  const { error } = await admin.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: Deno.env.get('RECOVERY_URL') ?? undefined },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) return json({ error: 'exists' }, 409);
    return json({ error: 'failed' }, 400);
  }
  return json({ ok: true, deprecated: true });
});
