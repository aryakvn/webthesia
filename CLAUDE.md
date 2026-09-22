# Webthesia

Synthesia clone in the browser. Vue 3 `<script setup>`, plain JS, Pinia setup stores, Vite.
Read `docs/architecture.md` first. `npm test` runs node:test on pure utils.

## Components (src/components)

- `PianoKeyboard` — props `low`, `high` (MIDI numbers, white keys). Highlights from
  `input.pressed` + `player.sounding`; mouse/touch play into the input store.
- `NoteHighway` — props `low`, `high`, `seconds` (look-ahead). Canvas; must share
  `low`/`high` with the keyboard.
- `TransportBar` — no props; play/pause/restart/seek/speed/open .mid on the player store.
- `MidiDevicePicker` — no props; connects WebMIDI (auto) and WebUSB (button), feeds input store.

## Composables (src/composables)

- `useWebMidi(onMessage)` → `{ supported, devices, error, connect }`; all inputs, hot-plug aware.
- `useWebUsbMidi(onMessage)` → same shape; `connect()` must run from a user gesture.

## Utils (src/utils)

- `keyboardLayout.js` — `isBlack(midi)`, `keyLayout(low, high)` → `[{ midi, black, x, w }]`
  in 0..1 width fractions; `trackColor(track, black)`.
- `midi.js` — `parseMidiMessage(bytes)` → `{ on, note, velocity } | null`;
  `usbMidiPackets(bytes)` → 3-byte messages; `findMidiIn(usbConfiguration)`.
- `songs.js` — song format, `demoSong`, `songFromMidiFile(file)`.
- `synth.js` — `resume()`, `playNote(midi, vel, dur)`, `noteOn(midi, vel)`, `noteOff(midi)`.

## Stores (src/stores)

- `player` — `song, time, playing, speed, sounding` + `play, pause, toggle, seek, restart, load(file)`.
- `input` — `pressed` (Map midi→velocity), `sound` + `noteOn, noteOff, handleMidi(bytes)`.
