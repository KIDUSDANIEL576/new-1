# Launch day — the complete checklist

The goal for today: **Trace running on both phones, everything tested, web app
properly live.** Public store listings are a separate, longer road (Play needs
days of identity verification + a 14-day closed test for new accounts; Apple
needs the $99 membership approved first) — the APK on your two phones IS the
launch for you two.

Total hands-on time: roughly 2.5–3.5 hours, most of it waiting on builds.

---

## The night before (5 minutes)

- [ ] A computer with **Node.js 18+** (https://nodejs.org → LTS) and **git**
      (https://git-scm.com)
- [ ] Your phone + your partner's phone (Android first — iOS needs the paid
      Apple membership)
- [ ] Access to `kidusdaniel576@gmail.com`
- [ ] Tell Claude "deploy the web app" so the Vercel deploy + privacy page are
      ready before you start (optional but recommended)

---

## Part 1 — Expo account + first build (~45 min, mostly waiting)

1. Go to **https://expo.dev/signup** → sign up **with email + password**
   (not Google sign-in — the command line asks for a password later and SSO
   makes that annoying). Free plan.
2. Open a terminal on the computer:

   ```sh
   git clone https://github.com/KIDUSDANIEL576/new-1.git trace
   cd trace
   git checkout claude/trace-prototype-mobile-5s5vfd
   cp .env.example .env
   npm install
   npm install -g eas-cli
   eas login          # the Expo email + password from step 1
   eas init           # Enter to accept — links the app, writes the projectId
   ```

3. **Do Part 2 (Firebase) now, before building** — it means one build instead
   of two. If you'd rather see it work first, skip ahead and rebuild later.
4. Start the build:

   ```sh
   eas build -p android --profile preview
   ```

   It prints a URL like `https://expo.dev/accounts/…/builds/…`. Open it —
   the build takes 10–25 minutes in Expo's cloud. Free-tier queue can add
   more at peak times; that's normal.

---

## Part 2 — Firebase, so push + buzz work with the app closed (~15 min)

Without this, drawing/realtime/widgets all work, but Android push (the
"left you a trace ❤️" banner and the buzz ring with the app closed) will not.

1. **https://console.firebase.google.com** → **Create a project** → name it
   `trace` → turn **off** Google Analytics (faster) → Create.
2. Inside the project: **Add app** → the **Android** icon → package name
   exactly `com.digirafthub.trace` → Register app.
3. **Download `google-services.json`** → put the file in the `trace` folder
   (repo root, next to `package.json`).
4. Open `app.json`, find the `"android"` section, add one line:

   ```json
   "android": {
     "googleServicesFile": "./google-services.json",
     ...
   }
   ```

5. Back in Firebase: click the **gear** (top-left) → **Project settings** →
   **Service accounts** tab → **Generate new private key** → a `.json`
   downloads. Keep it somewhere safe (this one IS secret).
6. In the terminal:

   ```sh
   eas credentials -p android
   ```

   Pick the `preview` profile → **Google Service Account** →
   **Manage your Google Service Account Key for Push Notifications (FCM V1)**
   → **Set up** → point it at the `.json` from step 5.
7. Build (or rebuild) with the command from Part 1 step 4.

---

## Part 3 — install on both phones (~10 min)

1. When the build page says **Finished**, it shows a QR code + an **Install**
   button. Open that page on **each phone** (scan the QR or send the link).
2. Tap **Install** → the APK downloads → Android warns about unknown apps →
   **Settings** → allow the browser to install → install.
3. Same APK, both phones. Done — Trace is on your home screens.

---

## Part 4 — the test script (~45 min, the fun part)

**Pairing**
- [ ] Phone A: open Trace → your real email + a password (6+ chars) → Enter
      (first Enter creates the account) → **Start our canvas** → you get a
      6-character code.
- [ ] Phone B: partner signs in with **their own email** → **I have a code** →
      enter it.

**The magic (Phase 1's success criterion)**
- [ ] Draw on A. It should appear on B **as you draw**, under 300ms.
- [ ] Draw on B, watch A. Check the "…is drawing" pill appears.

**Brushes & the paywall**
- [ ] Marker + Chalk draw. Glow / Neon / Secret show 🔒 and open the paywall
      (correct — you're on the free tier).
- [ ] Undo removes only your own last stroke. Clear asks first, clears both.

**Buzz**
- [ ] Finish a stroke → the Ring button lights gold. Press it → partner's
      phone (app open) rings + vibrates instantly.
- [ ] Partner closes the app fully → ring again after the 2-min cooldown →
      their phone gets the push with the chime (needs Part 2 done).

**Replay + streak**
- [ ] Press ⟲ Replay → your story draws itself back; scrub the slider.
- [ ] Both of you draw today → the 🔥 chip shows 1.

**Widgets**
- [ ] Long-press an empty home-screen spot → **Widgets** → **Trace** → add
      the 2×2 widget. Draw something → open the app once → the widget shows
      the latest canvas.

**Account**
- [ ] Long-press the **trace** wordmark → the account screen. Try rename and
      **Download my data** (share sheet should offer the JSON + SVG).

**Pro mode (test the paid features without a store)**
1. Open **https://supabase.com/dashboard/project/doadibyqqdimzzywcglv** →
   **SQL Editor** → New query:

   ```sql
   select id, invite_code from couples;
   ```
2. Copy your couple's `id`, then run:

   ```sql
   select grant_entitlement('PASTE-THE-ID-HERE', 'test');
   ```
3. Close and reopen the app on both phones: every brush unlocks, the lock
   icons vanish, "unlock" chip disappears.
- [ ] Draw with **Secret** (invisible ink) → partner sees a blur → they press
      **hold to read** → it reveals for 6 seconds.
- [ ] Keep Pro for yourselves, or undo it with
      `select revoke_entitlement('THE-ID');`

---

## Part 4.5 — your live URLs

These are **live now** — open them on your phone to check:

- App: `https://raw.githack.com/KIDUSDANIEL576/new-1/claude/trace-prototype-mobile-5s5vfd/web/index.html`
- Privacy: `https://raw.githack.com/KIDUSDANIEL576/new-1/claude/trace-prototype-mobile-5s5vfd/web/privacy.html`
- Support: `https://raw.githack.com/KIDUSDANIEL576/new-1/claude/trace-prototype-mobile-5s5vfd/web/support.html`

They work, but the URL is ugly and updates lag a few minutes (githack is a CDN
for source files, not a host). **Optional 3-minute upgrade to a clean domain:**

1. Go to **https://vercel.com/new**
2. **Import Git Repository** → choose `KIDUSDANIEL576/new-1`
   (click *Adjust GitHub App Permissions* first if it isn't listed)
3. **Framework Preset:** Other · **Root Directory:** click *Edit* → type `web`
4. **Deploy**
5. When it finishes: **Settings → Git → Production Branch** → change it to
   `claude/trace-prototype-mobile-5s5vfd` → **Save** → then
   **Deployments → ⋯ → Redeploy**

You'll get `trace-xxx.vercel.app` — instant updates on every push, and a free
place to attach a real domain later. Use whichever URL you have in Part 5.

*(I couldn't do this for you: the Vercel account connected to this session
returned "You don't have permission to create a project.")*

## Part 5 — Supabase dashboard settings (~10 min)

At **https://supabase.com/dashboard/project/doadibyqqdimzzywcglv**:

1. **Authentication → URL Configuration → Redirect URLs** → **Add URL** →
   paste your app URL from Part 4.5 (the Vercel one if you did the upgrade,
   otherwise the githack one). Without this, password-reset emails send links
   that bounce.
2. Send yourself a reset from the sign-in screen ("Forgot your password?")
   and click the link to prove the loop works. Note: the built-in mailer
   allows only a couple of emails per hour — one test, not five.
3. Leave **Confirm email** OFF for now — turning it on needs custom SMTP,
   which needs your domain (the thing you deferred). It's one switch later,
   no code change.

---

## Part 6 — RevenueCat prep (~20 min, optional today)

Real purchases need store products, which need store accounts — weeks, not
today. But you can stand up the pipeline so it's one step later:

1. **https://www.revenuecat.com** → sign up → create a project called `Trace`.
2. **Entitlements** → new entitlement, identifier exactly `trace_forever`.
3. **Integrations → Webhooks** → URL:
   `https://doadibyqqdimzzywcglv.supabase.co/functions/v1/revenuecat-webhook`
   → Authorization header: invent a long random string, save it.
4. Supabase dashboard → **Edge Functions → Secrets** → add
   `REVENUECAT_WEBHOOK_SECRET` = that same string.

Full store steps for later: MONETIZATION.md.

---

## Part 7 — tell Claude

- **Before you start (or the night before):** "deploy the web app" → gets you
  a real URL for Part 5, plus the privacy/support pages the stores will want.
- **If the build fails:** paste the error from the Expo build page. Same-day fix.
- **After testing:** report how it felt — latency, push, widget, the ring.
  Anything broken gets fixed while you're still holding the phones.
- **Once the build works:** say the word and the last two phone gaps get built —
  photos on the phone and the live camera glimpse — since there's finally a
  device to test them on. One more `eas build` after that.

## Explicitly NOT today

- **Play Store listing** — $25 + identity verification (days) + new accounts
  need a 14-day closed test with 12 testers before production. Start it this
  week if you want it; it runs in the background.
- **App Store / iOS** — $99/yr membership, 24–48h approval, then
  `eas build -p ios` + TestFlight. Same code, later day.
- **Custom SMTP / Confirm email** — needs your domain.
