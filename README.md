# Webthesia

Browser-based Synthesia clone: notes fall down a highway onto an on-screen piano,
and you play along on a MIDI keyboard (or the mouse/touch).

## Run

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # node --test, pure-logic checks
npm run build    # static build in dist/
```

WebMIDI and WebUSB need a secure context: `localhost` or HTTPS.

## Features (so far)

- 88-key keyboard (A0–C8) with note highlighting: track color while the song plays a note,
  yellow for notes you play, lime when you play a note the song wants.
- Canvas note highway, 3 s look-ahead, colored per track (green = track 1 / right hand,
  blue = track 2 / left hand), glow while sounding.
- Built-in demo song (Ode to Joy). Open any `.mid` file; percussion tracks are skipped.
- Play/pause (Space), restart, seek, speed 0.25×–1.5×.
- Input from all WebMIDI devices automatically, plus a WebUSB USB-MIDI driver.
- Play without hardware: computer keyboard rows `Z`–`M` (lower octave) and `Q`–`P` (upper),
  `-`/`=` shift octave. See [testing without a MIDI device](docs/midi-input.md#testing-without-a-midi-device).
- Simple built-in synth for song playback and input monitoring (toggle "Input sound"
  off if your keyboard has its own speakers).

## Browser support

| Feature | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| App + mouse play | yes | yes | yes |
| WebMIDI | yes | yes (site permission add-on prompt) | no |
| WebUSB | yes | no | no |

## Docs

- [docs/architecture.md](docs/architecture.md) — structure, data flow, song format
- [docs/midi-input.md](docs/midi-input.md) — WebMIDI vs WebUSB, device troubleshooting
- [CHANGELOG.md](CHANGELOG.md)
