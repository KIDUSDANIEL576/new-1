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
