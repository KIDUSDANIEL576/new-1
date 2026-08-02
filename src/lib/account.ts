// Everything a person can do to their own account.
//
// The shape every app owes its users and mostly doesn't ship: change your name,
// change your password, recover it when you've forgotten it, walk away from the
// couple, and delete the whole account for real. App Store guideline 5.1.1(v)
// makes the last one mandatory; the rest is just not trapping people.

import { EDGE_FUNCTIONS, RPCS } from '@/lib/backend';
import { supabase } from '@/lib/supabase';

/**
 * Where a password-recovery email sends people. It must also be listed under
 * Supabase → Authentication → URL Configuration → Redirect URLs, or the link
 * in the email will bounce. See ACCOUNT.md.
 */
export const RECOVERY_URL =
  process.env.EXPO_PUBLIC_RECOVERY_URL ??
  'https://raw.githack.com/KIDUSDANIEL576/new-1/claude/trace-prototype-mobile-5s5vfd/web/index.html';

export type Outcome = { ok: true } | { ok: false; message: string };

const fail = (message: string): Outcome => ({ ok: false, message });

/* ---------- email verification ----------
   Deliberately routed through Supabase's own signUp() rather than the old
   trace-signup endpoint, which minted pre-confirmed accounts. That meant a
   typo'd address was unrecoverable: no reset email could ever reach it, so a
   forgotten password meant a dead account.

   Because this is the standard path, the behaviour is decided by one dashboard
   switch — Authentication → Providers → Email → "Confirm email":
     OFF (today) → signUp returns a session, nobody is blocked, and the app
                   shows a gentle "confirm your email" banner.
     ON  (later) → signUp returns NO session and Supabase sends the email; the
                   client shows "check your inbox" and sign-in stays closed
                   until they click it.
   Same code either way — no flag of ours to keep in sync. */

export interface SignUpOutcome {
  ok: boolean;
  /** Account made, but they must click the emailed link before signing in. */
  needsVerification?: boolean;
  /** The address is already registered — this is a wrong password, not a new user. */
  alreadyRegistered?: boolean;
  message?: string;
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: RECOVERY_URL },
  });

  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return { ok: false, alreadyRegistered: true };
    }
    return { ok: false, message: 'Could not create your account — try again.' };
  }

  // Supabase deliberately obfuscates an existing address rather than confirming
  // it exists to a stranger: it returns a user with an empty identities array
  // and no session. That is this case, not a new signup.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { ok: false, alreadyRegistered: true };
  }

  if (!data.session) return { ok: true, needsVerification: true };
  return { ok: true, needsVerification: false };
}

/** True when Supabase refused a sign-in purely because the email isn't confirmed. */
export const isUnverifiedError = (message?: string | null) =>
  /email not confirmed|email_not_confirmed/i.test(message ?? '');

/** Re-sends the confirmation email — for a link that expired or never arrived. */
export async function resendVerification(email: string): Promise<Outcome> {
  const target = email.trim().toLowerCase();
  if (!target.includes('@')) return fail('Enter the email you signed up with.');
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: target,
    options: { emailRedirectTo: RECOVERY_URL },
  });
  if (error) return fail('Could not send that just now — try again shortly.');
  return { ok: true };
}

/**
 * Correct a mistyped address before it becomes unrecoverable. Supabase sends a
 * confirmation to the NEW address; the change only takes effect once clicked,
 * so a typo here can't lock anyone out either.
 */
export async function changeEmail(newEmail: string): Promise<Outcome> {
  const target = newEmail.trim().toLowerCase();
  if (!target.includes('@')) return fail("That doesn't look like an email.");
  const { error } = await supabase.auth.updateUser(
    { email: target },
    { emailRedirectTo: RECOVERY_URL }
  );
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return fail('That address already has an account.');
    }
    return fail('Could not change your email — try again.');
  }
  return { ok: true };
}

/** Rename yourself. This is the name your partner sees. */
export async function setDisplayName(name: string): Promise<Outcome> {
  const trimmed = name.trim();
  if (!trimmed) return fail('Pick a name your person will recognise.');
  const { error } = await supabase.rpc(RPCS.setDisplayName, { p_name: trimmed });
  if (error) return fail('Could not save that name — try again.');
  return { ok: true };
}

/**
 * Change your password. Requires the current one: a stolen unlocked phone
 * shouldn't be enough to lock the real owner out of their account.
 */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<Outcome> {
  if (newPassword.length < 6) return fail('Use at least 6 characters.');
  if (newPassword === currentPassword) return fail('That is already your password.');

  const { error: reauth } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (reauth) return fail('That current password is not right.');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return fail('Could not change your password — try again.');
  return { ok: true };
}

/** Sends the "forgot password" email. */
export async function sendPasswordReset(email: string): Promise<Outcome> {
  const target = email.trim().toLowerCase();
  if (!target.includes('@')) return fail('Enter the email you signed up with.');
  const { error } = await supabase.auth.resetPasswordForEmail(target, {
    redirectTo: RECOVERY_URL,
  });
  // Deliberately vague on failure: whether an email has an account is not
  // something a stranger should be able to probe.
  if (error) return fail('Could not send that just now — try again shortly.');
  return { ok: true };
}

/** Used on the recovery page, once the emailed link has established a session. */
export async function setNewPassword(newPassword: string): Promise<Outcome> {
  if (newPassword.length < 6) return fail('Use at least 6 characters.');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return fail('That link has expired — send yourself a new one.');
  return { ok: true };
}

export interface LeaveResult {
  left: boolean;
  coupleDeleted: boolean;
}

/**
 * Leave your couple. Your ink goes with you; theirs stays, and so does a paid
 * Trace Forever — the entitlement is on the couple. If you were the last one
 * out, the couple and everything in it is deleted.
 */
export async function leaveCouple(): Promise<Outcome & { result?: LeaveResult }> {
  const { data, error } = await supabase.rpc(RPCS.leaveCouple);
  if (error) return fail('Could not leave just now — try again.');
  return { ok: true, result: data as LeaveResult };
}

/**
 * Everything this account has made, as a file they can keep.
 *
 * The honest companion to a delete button: you shouldn't be able to erase
 * something you were never able to take with you. Their strokes are included
 * in full plus rendered to SVG so a person — not just a parser — can open it;
 * the partner's ink is counted but not included, because it's the partner's.
 */
export async function exportMyData(): Promise<Outcome & { data?: unknown }> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.exportMyData, {
    body: {},
  });
  if (error || !data) return fail('Could not build your export — try again.');
  return { ok: true, data };
}

/**
 * Delete the account, permanently. The typed confirmation is passed through to
 * the server, which refuses without it.
 */
export async function deleteAccount(): Promise<Outcome> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.deleteAccount, {
    body: { confirm: 'DELETE' },
  });
  if (error || !data?.deleted) return fail('Could not delete your account — try again.');
  await supabase.auth.signOut().catch(() => {});
  return { ok: true };
}
