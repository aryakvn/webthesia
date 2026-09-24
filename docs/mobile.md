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

- Neither web view exposes WebMIDI or WebUSB, so MIDI goes through the in-repo
  `NativeMidi` plugin instead (below). The "Connect USB…" button is hidden.
- Bluetooth MIDI: on iOS it works once the keyboard is paired in another app
  (e.g. GarageBand); on Android it isn't supported yet (needs a BLE scan +
  `MidiManager.openBluetoothDevice`). USB MIDI works on both (USB-C / camera adapter / OTG).

## Native MIDI plugin

Local plugin, no npm package: `android/app/src/main/java/com/aryakvn/webthesia/NativeMidiPlugin.java`
(`android.media.midi`, registered in `MainActivity`) and `ios/App/App/NativeMidiPlugin.swift`
(CoreMIDI, registered by `BridgeViewController` in the same file, which `Main.storyboard` uses).

JS API (`useNativeMidi.js` wraps it, same shape as `useWebMidi`):

- `start()` → `{ devices: [{ id, name }] }`, opens every input, hot-plug aware. Idempotent.
- `'midi'` event → `{ data: number[] }`, raw bytes; may hold several messages, so run
  them through `splitMidiMessages`.
- `'devices'` event → `{ devices }` whenever the list changes.
- The iOS silent switch still mutes WebAudio.
