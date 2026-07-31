# Trace Forever — how the money works

**$29.99, paid once, unlocks both partners, forever.**

The code for this is finished and deployed. What is *not* done is the part only
you can do: creating the store products and the RevenueCat account. Until those
exist, every couple is on the free tier and the purchase button says it isn't
available yet. Nothing is broken — there is simply nothing to buy.

---

## The tiers

|                    | Free                      | Trace Forever          |
| ------------------ | ------------------------- | ---------------------- |
| Shared live canvas | ✅                         | ✅                      |
| Home-screen widget | ✅                         | ✅                      |
| Brushes            | Marker, Chalk             | + Glow, Neon, **Secret (invisible ink)** |
| Photos             | 1 per day                 | Unlimited              |
| Replay             | Last 7 days               | Everything, day one on |

These limits are enforced **in the database**, not in the app. A modified
client, an old cached web page, or a hand-written API call all hit the same
wall. The apps check the tier only so people get a paywall instead of an error.

### Invisible ink

The Secret brush writes something your partner can see is *there* — a soft
blurred smudge — but can't read until they hold the "hold to read" button. It
reveals for six seconds, then hides itself again. It is deliberately excluded
from the widget snapshot: a secret on the home screen isn't a secret.

---

## The parts already built

**Database** (`supabase/migrations/20260731000001_entitlements.sql`,
`…000002_photo_events.sql`, both applied live)

- `entitlements` — one row per couple = that couple is Pro. Keyed by
  `couple_id`, which is *why* one purchase unlocks two people.
- No client can write it. There are no INSERT/UPDATE/DELETE policies at all;
  only the webhook (service role) can grant or revoke. Verified: a signed-in
  user is denied both the direct insert and the RPC.
- `my_status()` — the one call both apps make: am I Pro, photos used today,
  what the limits are.
- Triggers reject Pro brushes and the 2nd photo of a day for free couples.
- `photo_events` meters real photo changes and ignores the darken/fit slider,
  which rewrites the same field constantly.

**Webhook** (`supabase/functions/revenuecat-webhook`, deployed)

- Grants on `INITIAL_PURCHASE`, `NON_RENEWING_PURCHASE`, `UNCANCELLATION`,
  `TRANSFER`; revokes on `REFUND` and `EXPIRATION`.
- Idempotent — a redelivered event can't double-unlock (unique `rc_event_id`).
- Sandbox purchases unlock too, but are recorded as `store = 'test'` so real
  revenue stays distinguishable.
- Fails closed: with no secret configured it refuses every request.

**Apps** — paywall, locked brushes, invisible ink, and the "I already paid"
restore path, in both the Expo app and the web app (v4.0).

---

## What you need to do

### 1. RevenueCat (free until you're earning)

1. Sign up at [revenuecat.com](https://www.revenuecat.com), create a project
   called **Trace**.
2. Create an **entitlement** with identifier exactly `trace_forever`.
3. Create a **product** `trace_forever` in each store (below), attach both to
   that entitlement, and put them in the **current offering**.
4. Copy the two **public SDK keys** (one iOS, one Android) into `.env`:

   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_…
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…
   ```

### 2. Store products

- **Apple** — App Store Connect → your app → In-App Purchases → **Non-Consumable**,
  product ID `trace_forever`, price tier $29.99. Requires the Apple Developer
  Program ($99/yr) and a signed Paid Apps agreement.
- **Google** — Play Console → Monetize → In-app products → **One-time product**,
  product ID `trace_forever`, price $29.99. Requires a Play Console account ($25 once).

### 3. Point RevenueCat at the webhook

RevenueCat → Integrations → Webhooks:

- **URL** — `https://doadibyqqdimzzywcglv.supabase.co/functions/v1/revenuecat-webhook`
- **Authorization header** — invent a long random string.

Then set that same string as a Supabase secret (Dashboard → Edge Functions →
Secrets):

```
REVENUECAT_WEBHOOK_SECRET=<the same string>
```

Until this secret exists the function returns 500 to everything — by design, so
a missing configuration can never be mistaken for a working one.

### 4. Rebuild

`react-native-purchases` is a native module, so purchases only appear after a
new build:

```
eas build -p android --profile preview
```

---

## Testing it before any of that exists

You can exercise every paid path today. In the Supabase SQL editor:

```sql
-- find your couple
select c.id, c.invite_code from couples c;

-- unlock it
select grant_entitlement('<couple-id>', 'test');

-- ...and put it back
select revoke_entitlement('<couple-id>');
```

Reopen the app (or just switch away and back on web — it re-checks on focus)
and every brush, unlimited photos, and full replay are live. This is exactly
the path the webhook uses, so if it works here it works when the money is real.

---

## Honest status

| Piece | State |
| ----- | ----- |
| Entitlement schema, RLS, tier enforcement | **Done, applied live, tested** |
| Webhook function | **Deployed**, verified reachable + fails closed |
| Webhook end-to-end with a real event | **Untested** — needs the shared secret set |
| Paywall + gating, web | **Done**, verified in a browser |
| Paywall + gating, app | **Done**, typechecks; unverified on a device (no build yet) |
| Purchase itself | **Blocked on you** — needs store accounts and products |

No real money can be taken yet, and no code change is waiting on me to make
that possible — only the store setup above.
