# iOS / Android (Capacitor)

The same Vite build (`dist/`) runs inside a Capacitor native shell. Native projects
live in `android/` and `ios/` and are committed; the copied web assets are not.

```sh
npm run cap:sync     # vite build + copy dist/ into both native projects
npx cap open android # Android Studio
npx cap open ios     # Xcode (macOS only; uses Swift Package Manager, no CocoaPods)
```

Run `cap:sync` after any web change before building natively.

## CI builds

`.github/workflows/mobile.yml` runs on pushes to `main`, PRs and manual dispatch:

- **Android** → `webthesia-apk` artifact: a debug-signed APK, installable on any
  device with "install unknown apps" allowed.
- **iOS** → `webthesia-ipa` artifact: an **unsigned** IPA. iOS won't install it as-is;
  sideload with AltStore / Sideloadly (they re-sign with your Apple ID) or re-sign it.

Push a `v*` tag to also attach both files to a GitHub release.

Store-ready builds need signing secrets not wired up yet: an Android keystore
(`assembleRelease` + `signingConfigs`) and, for iOS, a distribution certificate +
provisioning profile (`xcodebuild archive` + `-exportArchive`).

## Limits in the native apps

- No MIDI hardware: neither WKWebView (iOS) nor Android WebView exposes WebMIDI or
  WebUSB, so the device picker shows them unsupported. Touch and a hardware/Bluetooth
  computer keyboard still work. Real MIDI needs a native plugin (CoreMIDI /
  `android.media.midi`) feeding `input.handleMidi`.
- The iOS silent switch still mutes WebAudio.
