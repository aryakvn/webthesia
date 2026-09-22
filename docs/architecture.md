# Architecture

Vue 3 (`<script setup>`, plain JS) + Pinia + Vite. No router yet (single screen).

```
src/
  App.vue                    layout: header / highway / keyboard, Space shortcut
  components/
    TransportBar.vue         play/pause, restart, seek, speed, open .mid
    MidiDevicePicker.vue     connects WebMIDI + WebUSB, shows devices, input-sound toggle
    NoteHighway.vue          canvas of falling notes
    PianoKeyboard.vue        DOM keyboard, highlights, mouse/touch play
  composables/
    useWebMidi.js            listen to all WebMIDI inputs
    useWebUsbMidi.js         USB-MIDI class driver over WebUSB
  stores/
    player.js                song + playback clock (rAF), which song notes are sounding
    input.js                 notes currently held by the player, from any source
  utils/
    keyboardLayout.js        key geometry (shared by canvas and DOM), track colors
    midi.js                  MIDI / USB-MIDI packet parsing, endpoint discovery
    songs.js                 song format, demo song, .mid parsing (@tonejs/midi, lazy-loaded)
    synth.js                 WebAudio triangle synth
tests/midi.test.js           node:test checks for the pure utils
```

## Data flow

```
MIDI device ──WebMIDI──┐
USB device ───WebUSB───┼─ raw bytes ─► input.handleMidi ─► input.pressed ─► PianoKeyboard
mouse/touch ───────────┘                     └─► synth (if Input sound)

player.play ─► rAF frame: time += dt·speed ─► synth.playNote for notes crossed
                                         └─► player.sounding ─► PianoKeyboard
NoteHighway: own rAF loop, reads player.time + player.song each frame
```

Every input source ends in `input.noteOn/noteOff`, so future features
(scoring, wait mode) only need to watch the input store.

## Geometry

`keyLayout(low, high)` returns each key's `x`/`w` as fractions of the full width.
The keyboard uses them as CSS percentages, the highway multiplies by canvas width,
so both stay aligned at any size. Index with `keys[midi - low]`.

The highway maps song time to y: the hit line (top of the keyboard) is `player.time`,
the top of the canvas is `player.time + seconds` (prop, default 3).

## Song format

```js
{
  name: 'Ode to Joy',
  tracks: ['Right hand', 'Left hand'],
  duration: 19.1, // seconds, end of last note
  notes: [{ midi: 64, time: 0, duration: 0.57, velocity: 90, track: 0 }], // sorted by time
}
```

Playback starts at `time = -LEAD_IN` (2 s) so the first notes fall into view.

## Known limits

- Player and highway scan all notes per frame (marked `ponytail:`); fine for typical
  piano files, add a time-indexed cursor if large files stutter.
- Synth is a triangle oscillator; a sampled piano would sound much better.
- Keyboard range fixed to 88 keys; auto-fitting to the song's range is a later feature.
