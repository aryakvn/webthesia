# MIDI input: WebMIDI and WebUSB

Both paths deliver raw 3-byte MIDI messages to `input.handleMidi` (see `stores/input.js`).
Currently only note-on/note-off are used; other messages are ignored.

## WebMIDI (primary)

`composables/useWebMidi.js` calls `navigator.requestMIDIAccess()` on page load and
listens to **every** connected input — no device selection needed. Plug/unplug is
handled via `onstatechange`, so hot-plugging just works.

This covers nearly every real device: class-compliant USB-MIDI keyboards, digital
pianos, 5-pin DIN via a USB interface, Bluetooth MIDI paired at OS level, and virtual
ports (loopMIDI, IAC).

## WebUSB (fallback)

`composables/useWebUsbMidi.js` is a small USB-MIDI 1.0 driver: "Connect USB…" opens
Chrome's device chooser, then it

1. opens the device and selects configuration 1 if none is active,
2. finds a bulk IN endpoint (`utils/midi.js#findMidiIn`), preferring a MIDIStreaming
   interface (class 1, subclass 3), else a vendor-specific one (class 0xFF),
3. claims the interface and loops `transferIn`, decoding 4-byte USB-MIDI event
   packets (`usbMidiPackets`).

### When WebUSB can't work (and WebMIDI should be used)

- **Standard USB-MIDI devices:** Chrome protects the audio interface class, so claiming
  a class-1 interface throws `SecurityError`. These devices already work through
  WebMIDI. The app shows this explanation.
- **OS driver holds the device:** `open()`/`claimInterface()` fails with `NetworkError`.
  On Windows, WebUSB needs the WinUSB driver bound to the device (e.g. with Zadig) —
  which then removes it from WebMIDI and other apps. On Linux, a udev rule granting
  access may be needed.

So WebUSB is useful for devices exposing MIDI on a vendor-specific interface, custom
firmware (e.g. microcontroller keyboards), or machines where WebMIDI is unavailable
but the device has a WinUSB/libusb driver.

## Testing without a MIDI device

1. **Computer keyboard** (`composables/useComputerKeyboard.js`) — always on. `Z S X D C V G B
   H N J M` is the lower octave, `Q 2 W 3 E R 5 T 6 Y 7 U` the one above, `-`/`=` shift
   octave, and the current base octave shows in the "PC keys" chip. Keys are mapped by
   `KeyboardEvent.code`, so the physical layout is what counts. It emits raw MIDI bytes
   through the same `handleMidi` path as real devices, so it exercises that code too.
2. **Dev console** — `npm run dev` exposes the stores:
   ```js
   webthesia.input.handleMidi([0x90, 60, 100]) // note on,  middle C
   webthesia.input.handleMidi([0x80, 60, 0])   // note off
   webthesia.player.seek(5)
   ```
3. **Virtual MIDI port** — to exercise the real WebMIDI stack, pair a virtual port with an
   on-screen MIDI keyboard: loopMIDI + VMPK on Windows, the IAC driver + a MIDI app on
   macOS, `snd-virmidi`/a2jmidid on Linux. The port shows up as a normal device chip.

The WebUSB path is the one thing none of these cover; it needs actual hardware.

## Troubleshooting

- No devices listed: check the site's MIDI permission (lock icon in the address bar),
  and that no other app has exclusive access (on Windows, most MIDI drivers allow
  only one app at a time — close DAWs).
- Double sound: uncheck "Input sound" when your keyboard has its own speakers.
