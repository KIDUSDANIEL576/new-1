# Trace Mobile — build & install (≈30 min)

The app in this repo is fully wired to the live backend. The only thing it
needs from you is a **free Expo account** to run the cloud build.

## One-time setup

1. **Create a free Expo account** at https://expo.dev (Sign up → free plan).
2. On any computer with Node 18+:

   ```sh
   git clone https://github.com/KIDUSDANIEL576/new-1.git trace && cd trace
   git checkout claude/trace-prototype-mobile-5s5vfd
   cp .env.example .env        # live values are already filled in
   npm install
   npm install -g eas-cli
   eas login                   # your new Expo account
   eas init                    # links the app to your account (writes projectId)
   ```

## Android first — free, no store account needed

```sh
eas build -p android --profile preview
```

- Takes ~10–15 min in Expo's cloud. It prints a URL with a QR code.
- Open that URL on each phone → **Install** the APK (allow "install unknown
  apps" when Android asks).
- Sign in with the same email/password you use on the web version — same
  account, same canvas, same couple.

### Android push notifications (one extra step)

Expo needs Firebase Cloud Messaging credentials to deliver Android push:

1. https://console.firebase.google.com → Add project (call it `trace`).
2. Add an Android app with package name `com.digirafthub.trace`; download
   `google-services.json` into the repo root.
3. Uncomment/add `"googleServicesFile": "./google-services.json"` under
   `android` in `app.json`, then `eas credentials` → Android → set up FCM.
4. Rebuild (`eas build -p android --profile preview`). Now "left you a
   trace ❤️" pushes arrive with the screen off.

## iOS — needs an Apple Developer account ($99/yr)

```sh
eas build -p ios --profile preview     # EAS manages certificates for you
eas submit -p ios                      # → TestFlight on both iPhones
```

Push on iOS needs no extra step — EAS manages APNs keys automatically.

## Day-to-day development

```sh
npx expo start        # QR code → Expo Go for quick UI iteration
```

Remote push requires a real build (preview/development profile), not Expo Go.

## Notes

- `.env` values are public client keys; Row Level Security protects the data.
- The bundle id is `com.digirafthub.trace` — if you want a different one for
  the stores (e.g. `love.trace.app`), change it BEFORE the first store
  submission; it can't change afterwards.
