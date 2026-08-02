# Account management

Everything a person can do to their own account. Reachable from the account
panel — **long-press the wordmark** in the app, **tap the top-right icon** on
the web.

| | Where |
|---|---|
| Change your display name | Account panel |
| Change your password (asks for the current one) | Account panel |
| Forgot your password | Sign-in screen → *Forgot your password?* |
| Leave your couple | Account panel |
| **Delete your account** | Account panel → red box, two confirmations |
| Sign out | Account panel |

---

## ⚠️ One setting you must add

Password recovery emails contain a link back to the web app. Supabase refuses
to send anyone to a URL that isn't on its allow-list, so **until you add it,
the reset email arrives but the link bounces.**

Supabase Dashboard → **Authentication** → **URL Configuration** → **Redirect
URLs**, add:

```
https://raw.githack.com/KIDUSDANIEL576/new-1/claude/trace-prototype-mobile-5s5vfd/web/index.html
```

Add whatever domain you eventually host the web app on too. The app reads this
from `EXPO_PUBLIC_RECOVERY_URL` (see `.env.example`) so it can move without a
code change.

---

## How password reset works

1. **Sign-in → "Forgot your password?"** sends the email. The screen says the
   same thing whether or not that email has an account — whether someone is a
   user here isn't something a stranger should be able to probe by typing
   addresses into a form.
2. The emailed link opens the **web app**, which detects `type=recovery` in the
   URL *before* deciding where to send you — otherwise you'd land on your
   canvas with no chance to set the password you came for.
3. New password set → signed straight in.

The phone app sends the same email and points at the same web page. That avoids
a deep-link round trip that can't be tested without a build; after resetting,
you sign in on the phone with the new password.

**Changing a password while signed in** requires the current one first. A
borrowed unlocked phone shouldn't be enough to lock the real owner out of their
own account.

---

## What deleting an account actually does

Required by **App Store guideline 5.1.1(v)**: any app that lets you create an
account must let you delete it from inside the app. So this genuinely deletes —
it does not deactivate, flag, or hide.

**Goes:** your login, your ink on every canvas, your streak marks, your push
token, your widget token, your half of the couple.

**Stays:** your partner's ink, their photos, and a paid **Trace Forever** — the
entitlement belongs to the *couple*, so whoever stays keeps it, and whoever
joins them next inherits it. Deleting your account is not a refund, and it
shouldn't punish the person who didn't leave.

**Unless you were the last one out** — then the couple and everything inside it
goes with you: canvases, all strokes, uploaded photos, the widget snapshot, and
the entitlement.

### The part that would have broken

`strokes.author_id` and `daily_marks.user_id` reference `auth.users` with **NO
ACTION**, not `CASCADE`. Deleting a user who had ever drawn anything would have
failed on a foreign key violation. `purge_user_data()` clears those first,
which is why deletion is an RPC plus an edge function rather than one call to
the auth admin API. There's a regression test for exactly this in the migration
history — it asserts the naive delete is blocked, then that the real path
succeeds.

Storage isn't covered by any foreign key either, so the couple's photos and
snapshot are removed by hand.

### Leaving vs. deleting

**Leave** keeps your login and drops you back at pairing, so you can join a new
couple with a fresh code. **Delete** removes the login too. Leaving runs the
same teardown of your ink; the difference is only whether the account survives.

---

## Still missing

- **Email change** — you're stuck with the address you signed up with.
- **Data export** — no "download everything I've made" yet. Not required by
  either store, but it's the honest companion to a delete button.
- **Email verification** — accounts are created pre-confirmed by the
  `trace-signup` function, so a typo'd address is unrecoverable: no reset email
  can reach it. Worth closing before launch.
