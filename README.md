# trace

**"Leave me a trace."** A couples app where whatever one partner draws appears on
the other's phone in real time. Two people, one canvas, forever.

Built from [CLAUDE.md](./CLAUDE.md). All four phases plus buzz and the full
account surface are implemented — see [STATUS.md](./STATUS.md) for exactly what
is verified, what is deployed, and what is still waiting on an account or a
build.

## Stack

- **Expo SDK 52** (React Native, TypeScript, expo-router)
- **@shopify/react-native-skia** — 60fps stroke rendering
- **Supabase** — email + password auth, Postgres + RLS, Realtime Broadcast + Presence, Storage
- **expo-notifications** for push, **RevenueCat** for Trace Forever
- A no-install **web version** in `web/index.html` on the same backend

## Backend — live

Dedicated Supabase project **`doadibyqqdimzzywcglv`**. Tables are unprefixed and
every one of them is RLS-locked to couple membership:

`couples` · `members` · `canvases` · `strokes` · `daily_marks` · `push_tokens`
· `push_log` · `widget_tokens` · `join_attempts` · `entitlements` ·
`photo_events` · `buzz_log`

Names live in one file: `src/lib/backend.ts`.

Edge functions: `notify-partner`, `buzz-partner`, `render-snapshot`,
`widget-snapshot`, `revenuecat-webhook`, `delete-account`, `export-my-data`,
`trace-signup` *(deprecated)*.

`.env.example` ships the live values — the anon key is a public client key by
design, and RLS is what guards the data.

## Setup

```bash
npm install
cp .env.example .env
npx expo start        # Expo Go is fine for canvas iteration
```

Skia and drawing work in Expo Go. **Push, widgets, the buzz ring sound,
purchases, and file export all need a real build** — see [MOBILE.md](./MOBILE.md).

The web version needs no install at all: open `web/index.html` on any device.

### The Phase 1 success criterion

Two phones, same couple: one draws → the other sees strokes appear live in
**under 300ms**.

1. Phone A: sign in → *Start our canvas* → gets a 6-character code.
2. Phone B: sign in → *I have a code* → enter it.
3. Draw. Watch the other screen.

## How the realtime protocol works

Channel per couple (`trace:couple:{couple_id}`, private — locked to members via
RLS on `realtime.messages`):

| event | payload | when |
|---|---|---|
| `stroke:start` | `{strokeId, authorId, brush, color, width}` | finger down |
| `stroke:points` | `{strokeId, pts: [[x,y],…]}` | batched every ~50ms while drawing |
| `stroke:end` | `{strokeId, dbId}` | finger up, after the row persists |
| `stroke:undo` / `canvas:clear` / `canvas:reload` | | mirrored edits |
| `canvas:bg` | `{url}` | photo background changed |
| `buzz` | `{from}` | Ring pressed — rings their phone, doesn't just banner it |

Presence on the same channel drives the *"…is drawing"* pill. Points are
normalized 0..1 so both phones render identically. Completed strokes land
append-only in `strokes` — that table **is** Relationship Replay.

## What's built

**The canvas** — live shared drawing, five brushes, five colours,
undo-own-stroke, clear, presence, reconnect with backoff, full rehydration on
open.

**Photos & replay** *(web only so far)* — draw on a photo, scrub your whole story
back, Daily Love Streak.

**The widget** — iOS WidgetKit (home + lock screen) and an Android home-screen
widget, both fed by a server-rendered snapshot PNG that re-renders on every
change.

**Trace Forever** — $29.99 once, unlocks *both* partners because the entitlement
is keyed by couple, not by user. Free tier gets marker + chalk, one photo a day,
the widget, and 7 days of replay. See [MONETIZATION.md](./MONETIZATION.md).

**Invisible ink** — the Secret brush writes something they can see is *there* but
can't read until they hold "hold to read". Kept off the widget and out of replay,
because a secret on the home screen isn't a secret.

**Buzz** and **accounts** — below.

## Buzz — ringing their phone

The Ring button lights up once you've finished a trace, so you buzz them to
something waiting rather than to an empty canvas. Two paths at once:

- **Their app is open** — the `buzz` broadcast rings it instantly, the same
  sub-300ms path as strokes. No notification would have fired otherwise.
- **Their app is closed** — `buzz-partner` sends a high-priority push carrying a
  custom ring sound (`assets/buzz.wav`) on a MAX-importance Android channel with
  a long vibration.

**What it can't do, honestly:** ring through silent mode. iOS Critical Alerts
need an Apple entitlement granted almost exclusively to medical and safety apps,
and CallKit is contractually VoIP-only — using either here gets the app rejected.
On a phone that isn't silenced this reads as ringing; on a silenced phone it
respects the silence.

**Rate limited on the server**: one buzz per recipient per 2 minutes (`buzz_log`,
no RLS policies — a client that could forge rows could defeat its own limit).
Throttled per *recipient*, so it protects the person being buzzed while still
letting them buzz straight back. This is an attention weapon pointed at someone
you love; the limit doesn't belong anywhere the client can argue with it.

The ring is generated by `assets/make-buzz-sound.py` rather than shipped as an
opaque blob — two soft sine partials a fifth apart, struck twice, twice.

## Accounts

Confirm your email, correct a mistyped one, rename yourself, change your
password, recover a forgotten one, leave your couple, **download everything
you've made**, and delete your account for good. Long-press the wordmark in the
app; tap the top-right icon on the web.

Deleting is real deletion, as App Store guideline 5.1.1(v) requires: your ink
goes, your partner's stays, and a paid Trace Forever stays with whoever remains.
The export gives you your strokes as JSON *and* your drawings as openable SVG,
with your partner's ink deliberately left out because it's theirs.

See [ACCOUNT.md](./ACCOUNT.md) — including the one Supabase redirect-URL setting
password reset needs.

## Project layout

```
app/              expo-router screens (sign-in → pair → canvas, account)
src/hooks/        useAuth, useCouple, useSharedCanvas (the realtime core)
src/components/   CanvasBoard (Skia + gestures), StrokeRenderer, Toolbar,
                  Paywall, PresencePill, Toast
src/lib/          supabase, backend names, brushes, notifications, buzz,
                  entitlements, iap, account, export, widget
src/widgets/      Android widget surface
targets/widget/   iOS WidgetKit target (Swift)
supabase/         migrations + edge functions
web/index.html    the no-install web version, same backend
assets/           icons, buzz.wav + the script that generates it
```

## Docs

| | |
|---|---|
| [STATUS.md](./STATUS.md) | What's done, what's verified, what's blocked |
| [MOBILE.md](./MOBILE.md) | Build and install on real phones |
| [WIDGET.md](./WIDGET.md) | Adding the home-screen widget |
| [MONETIZATION.md](./MONETIZATION.md) | Trace Forever, RevenueCat, store setup |
| [ACCOUNT.md](./ACCOUNT.md) | Deletion, reset, verification, export |

## What's deliberately not here

Everything in the Non-goals list. See CLAUDE.md — Ponytail discipline applies.
