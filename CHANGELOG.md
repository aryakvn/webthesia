# Changelog

<!--
Maintained for both humans and Claude Code to reference. Before
implementing a feature or fix, check the entries below first — it may
already be done, which saves searching the whole codebase.

Format (based on Keep a Changelog: https://keepachangelog.com/en/1.1.0/):
- New entries go under "## [Unreleased]" until a release is cut.
- Categories: Added, Changed, Fixed, Deprecated, Removed, Security.
  Only add a category heading once it has an entry under it.
- One bullet per entry, imperative mood, one line where possible:
    - Add CSV export to the reports page. (Refs: JIRA-482, #210)
- Include "(Refs: ...)" only when there's an external reference — a Jira
  key, GitHub issue/PR number, Trello card title/URL, or similar tracker
  ID. Comma-separate multiple references. Omit the parenthetical entirely
  if there's nothing to reference.
- To cut a release: rename "## [Unreleased]" to "## [X.Y.Z] - YYYY-MM-DD"
  and start a fresh, empty "## [Unreleased]" section above it.
- Never delete or rewrite past entries — only append.
-->

## [Unreleased]

## [1.0.0] - 2026-09-24

### Added
- Add Vue 3 + Vite + Pinia project scaffold with docs (README, docs/, CLAUDE.md).
- Add 88-key on-screen piano with song/input highlighting and mouse/touch play.
- Add canvas falling-notes highway, colored per track, aligned to the keyboard.
- Add song playback: demo song, .mid file loading, play/pause (Space), restart, seek, speed.
- Add WebMIDI input from all connected devices with hot-plug support.
- Add WebUSB USB-MIDI driver for vendor-specific/WinUSB devices.
- Add built-in WebAudio synth for playback and input monitoring.
- Add computer-keyboard input (Z–M / Q–P rows, -/= octave shift) so the app is playable without MIDI hardware.
- Add dev-only `window.webthesia` store handle for driving input/playback from the console.
- Serve the dev server over HTTPS on all interfaces so phones/tablets can load it in a secure context.
- Add GitHub repo links (github.com/aryakvn/webthesia) to README and package.json metadata.
- Add Capacitor iOS/Android wrapper (`android/`, `ios/`, `npm run cap:sync`).
- Add GitHub Actions workflow building a debug APK and unsigned IPA, attached to releases on `v*` tags.
- Add in-repo `NativeMidi` Capacitor plugin (CoreMIDI on iOS, android.media.midi on Android) so the mobile apps take MIDI keyboard input.
