# Trace — status

Last updated 2026-08-02, branch `claude/trace-prototype-mobile-5s5vfd`.

**One sentence:** everything in the spec is built and the backend is live and
tested, but nothing has ever run on a phone — that single step gates most of
what's left.

---

## The short version

| | |
|---|---|
| Backend | **Live and tested** on Supabase `doadibyqqdimzzywcglv` |
| Web app | **Working today** — no install, real accounts, real drawing |
| Phone app | **Written and typechecking, never run on a device** |
| Money | **Plumbed and tested**; no store products exist yet |
| Blocking everything | A free Expo account → `eas build` |

---

## What's done

### Phase 1 — the live canvas ✅
Shared canvas, 5 brushes, 5 colours, undo-own-stroke, clear, presence pill,
reconnect with backoff, full rehydration, throttled partner push. Realtime
streams over private per-couple Broadcast channels.

### Phase 2 — photos & replay ⚠️ web only
Photo backgrounds with fit/darken, Relationship Replay scrubber, Daily Love
Streak. **All three exist only in the web app.** The phone app writes streak
data but never displays a streak, and has no photo picker or replay UI. This is
the largest functional gap in the project.

### Phase 3 — the widget ✅
iOS WidgetKit (small/medium/large + lock screen), Android home-screen widget,
server-rendered snapshot PNG, refresh triggers on stroke end, undo, clear and
photo change from both clients. Snapshot pipeline tested end to end (a real
45 KB PNG rendered, served with a valid token, rejected with a bad one).

### Phase 4 — Trace Forever ✅ code, ⛔ store
$29.99 once, entitlement keyed by **couple** so one purchase unlocks both.
Free/Pro limits enforced by database triggers, not by the client. RevenueCat
webhook deployed, idempotent, fails closed. Paywall in both clients. Invisible
ink shipped as the flagship paid brush.

### Buzz ✅
Ring their phone — instant over realtime when their app is open, a
high-priority push with a custom ring sound when it isn't. Server-side throttle
of one buzz per recipient per 2 minutes.

### Accounts ✅
Email confirmation with resend and typo correction, password reset, change
password, rename, leave couple, **data export**, and real account deletion.

---

## What's verified, and how

| Area | Evidence |
|---|---|
| Free/Pro enforcement | Live DB test: free blocked on glow/neon/secret and the 2nd daily photo; Pro allowed; grants idempotent |
| Entitlement security | A signed-in client is **denied** both the direct insert and the RPC — it cannot unlock itself |
| Photo metering | Slider churn doesn't burn the daily photo; a genuinely new photo does |
| Buzz throttle | Window, per-recipient scoping, buzz-back, and 121s expiry all checked against the live table |
| Account deletion | Live test proves the naive delete **fails** on a foreign key, then that the real path succeeds, the partner keeps their ink and their entitlement, and the last member out takes the couple with them |
| Data export | End-to-end with a **real signed-in JWT**: my strokes exported, partner's counted but excluded, asserted their ink colours appear nowhere in the payload |
| Snapshot pipeline | Real PNG rendered and served; bad token rejected |
| Web UI | Browser-tested: paywall, brush locks, invisible-ink reveal + auto-hide, buzz (audio, vibration, cooldown), account panel, delete confirmation, recovery landing, export downloads |
| Types | `npm run typecheck` clean |
| Security advisors | No outstanding findings from any migration in this work |

All test users, couples and strokes were deleted afterwards. The database
currently holds zero rows.

### What is *not* verified

- **Anything on a physical phone.** No build has ever been produced.
- Two-phone realtime latency — the <300ms criterion is proven web-to-web only.
- Push notifications end to end (needs two devices).
- Widgets on a real home screen (the pipeline that feeds them is proven).
- The RevenueCat webhook's success path (needs the shared secret set).
- Any real purchase.

---

## Blocked on you

### 1. The build — unblocks most of the list above
Free Expo account → `eas build -p android --profile preview` → install.
See [MOBILE.md](./MOBILE.md).

### 2. Supabase dashboard
- Add the recovery URL to **Authentication → URL Configuration → Redirect URLs**,
  or reset emails send links that bounce.
- Configure **custom SMTP**, then turn on **Confirm email**. The built-in mailer
  is rate-limited to a handful of messages an hour.
- Set `REVENUECAT_WEBHOOK_SECRET` once RevenueCat exists.

### 3. Stores and money
Apple Developer ($99/yr), Play Console ($25 once), a RevenueCat account, and a
`trace_forever` product at $29.99 in both stores.
See [MONETIZATION.md](./MONETIZATION.md).

### 4. Launch paperwork
Privacy policy and support URLs (both stores require live URLs), Play Data
Safety form, Apple privacy labels, store listing copy and screenshots.

---

## Known gaps

**Functional**
- The phone app lacks photos, replay, the streak display, and the
  Together/From/Mine views that the web app has.
- No email *change* for a confirmed address (only correcting an unconfirmed one).

**Product**
- Free replay's 7-day window is enforced client-side only. Brush and photo
  limits are genuinely server-enforced; that one isn't, because the strokes are
  readable either way.
- Uploaded photos accumulate; nothing prunes old ones.
- Invite codes never expire and can't be regenerated.

**Housekeeping**
- `trace-rt-boot` is a retired E2E test stub still deployed — safe to delete.
- `trace-signup` is deprecated but kept live so older cached web pages keep
  working.

---

## Anything to know before touching this

- **The database owns the rules.** Tier limits, buzz throttling and entitlements
  are enforced in Postgres. Clients check them only so people meet a paywall
  instead of an error. Don't move enforcement into the client.
- **`strokes.author_id` and `daily_marks.user_id` are `NO ACTION`, not
  `CASCADE`.** Anything that removes a user must clear those first or the delete
  fails on a foreign key.
- **The entitlement is on the couple.** Anything that reasons about "who paid"
  should reason about the pair, not the person.
- Migrations live in `supabase/migrations/` and are all applied. Edge functions
  live in `supabase/functions/` and are all deployed.
