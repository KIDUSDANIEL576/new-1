# Trace Widgets — the moat 🏰

Her latest drawing, living on your home screen. This is how it works and how
to get it onto your phones.

## How it works (already live server-side)

1. Every time either of you finishes a stroke (app or web), the backend
   re-renders your canvas to a PNG (`render-snapshot` function — same brushes,
   same dusk backdrop, photo backgrounds included).
2. The widget fetches that PNG through a private, token-secured endpoint
   (`widget-snapshot`). The token is minted automatically the first time you
   open the canvas in the mobile app — nothing to configure.

## Getting the widgets on your phones

The widgets ship inside the app build. After pulling the latest branch:

```sh
npm install                                  # picks up the two new widget packages
eas build -p android --profile preview       # Android
eas build -p ios --profile preview           # iOS (needs Apple Developer)
```

### Android
1. Install the new APK, open the app once (that mints the widget token).
2. Long-press the home screen → **Widgets** → **Trace** → drag it on.
3. It refreshes every ~30 min, and immediately when you open the app.

### iOS (17+)
1. Install the build (TestFlight or dev build), open the app once.
2. Long-press the home screen → **+** → search **Trace** → add
   (small, medium, or large).
3. **Lock screen:** long-press the lock screen → Customize → add the Trace
   rectangular widget.
4. iOS refreshes widgets on its own schedule (~15 min) and when you open
   the app.

## Notes & honest caveats

- **Refresh cadence** is OS-controlled (15–30 min), not instant. Instant
  widget refresh via silent push is a later polish item — the plumbing
  (snapshot on every stroke) is already in place for it.
- The snapshot endpoint token is a 64-char random secret per user; revoke by
  deleting the row in `widget_tokens` (a settings button can do this later).
- The iOS widget target requires Apple Developer signing; EAS handles the
  certificates automatically, including the widget extension.
- First widget render needs one drawing to exist; before that it shows the
  quiet "leave me a trace" placeholder.
