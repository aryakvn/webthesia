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

### Added
- Add Vue 3 + Vite + Pinia project scaffold with docs (README, docs/, CLAUDE.md).
- Add 88-key on-screen piano with song/input highlighting and mouse/touch play.
- Add canvas falling-notes highway, colored per track, aligned to the keyboard.
- Add song playback: demo song, .mid file loading, play/pause (Space), restart, seek, speed.
- Add WebMIDI input from all connected devices with hot-plug support.
- Add WebUSB USB-MIDI driver for vendor-specific/WinUSB devices.
- Add built-in WebAudio synth for playback and input monitoring.
