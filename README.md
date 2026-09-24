# Webthesia

Browser-based Synthesia clone: notes fall down a highway onto an on-screen piano,
and you play along on a MIDI keyboard (or the mouse/touch).

Repo: <https://github.com/aryakvn/webthesia>

## Run

```sh
git clone git@github.com:aryakvn/webthesia.git && cd webthesia
npm install
npm run dev      # http://localhost:5173
npm test         # node --test, pure-logic checks
npm run build    # static build in dist/
```

The dev server runs over HTTPS on all network interfaces (`@vitejs/plugin-basic-ssl`),
because WebMIDI, WebUSB and pointer input all need a secure context — plain
`http://192.168.x.x` is not one.

## Test on an iPad / phone

1. `npm run dev` and use the printed **Network** URL, e.g. `https://192.168.0.98:5173/`.
   Pick the address on the same Wi-Fi as the device (ignore VPN/VMware ones).
2. The cert is self-signed, so Safari warns once: **Show Details → visit this website**.
   Chrome on Android: **Advanced → Proceed**. Repeat after the cert expires (~30 days,
   cached in `node_modules/.vite`; delete that folder to regenerate).
3. If the page doesn't load at all, Windows Firewall is blocking the port — allow Node.js
   on private networks, or `netsh advfirewall firewall add rule name="vite" dir=in
   action=allow protocol=TCP localport=5173`.

On iOS everything works except MIDI: Safari has no WebMIDI or WebUSB, so play by touch.
No sound? The silent switch mutes WebAudio in Safari.

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

## iOS / Android apps

Capacitor wraps the web build as native apps; CI builds an APK and an unsigned IPA
on every push to `main` (Actions → *Mobile builds* → artifacts). See
[docs/mobile.md](docs/mobile.md).

## Browser support

| Feature | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| App + mouse play | yes | yes | yes |
| WebMIDI | yes | yes (site permission add-on prompt) | no |
| WebUSB | yes | no | no |

## Docs

- [docs/architecture.md](docs/architecture.md) — structure, data flow, song format
- [docs/midi-input.md](docs/midi-input.md) — WebMIDI vs WebUSB, device troubleshooting
- [docs/mobile.md](docs/mobile.md) — Capacitor iOS/Android wrapper and CI builds
- [CHANGELOG.md](CHANGELOG.md)
