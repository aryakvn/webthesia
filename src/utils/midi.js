// Turn a raw 3-byte MIDI channel message into a note event, or null for anything else.
// Note-on with velocity 0 is a note-off by spec.
export function parseMidiMessage([status, note, velocity]) {
  const type = status & 0xf0
  if (type === 0x90 && velocity > 0) return { on: true, note, velocity }
  if (type === 0x80 || type === 0x90) return { on: false, note, velocity: 0 }
  return null
}

// USB-MIDI 1.0 event packets are 4 bytes: [cable << 4 | CIN, midi0, midi1, midi2].
// Keep channel-voice packets (CIN 0x8..0xE), return their 3 MIDI bytes.
export function usbMidiPackets(bytes) {
  const out = []
  for (let i = 0; i + 3 < bytes.length; i += 4) {
    const cin = bytes[i] & 0x0f
    if (cin >= 0x8 && cin <= 0xe) out.push([bytes[i + 1], bytes[i + 2], bytes[i + 3]])
  }
  return out
}

// Find a bulk IN endpoint carrying USB-MIDI in a WebUSB USBConfiguration.
// Prefers a standard MIDIStreaming interface (class 1 / subclass 3), falls back to
// vendor-specific (0xFF) interfaces, which many devices use with the same packet format.
export function findMidiIn(config) {
  let fallback
  for (const iface of config.interfaces) {
    for (const alt of iface.alternates) {
      const endpoint = alt.endpoints.find((e) => e.direction === 'in' && e.type === 'bulk')
      if (!endpoint) continue
      const hit = { interfaceNumber: iface.interfaceNumber, alternateSetting: alt.alternateSetting, endpoint }
      if (alt.interfaceClass === 1 && alt.interfaceSubclass === 3) return hit
      if (alt.interfaceClass === 0xff) fallback ??= hit
    }
  }
  return fallback
}

// Split a raw MIDI 1.0 byte stream (one native packet, may hold several messages)
// into single channel messages. Handles running status; drops SysEx, system and
// real-time messages.
export function splitMidiMessages(bytes) {
  const out = []
  let status = 0
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i]
    if (b >= 0x80) {
      if (b < 0xf8) status = b < 0xf0 ? b : 0 // real-time (0xF8+) keeps running status
      i++
      continue
    }
    if (!status) { i++; continue } // SysEx / system data or stray byte
    const len = (status & 0xe0) === 0xc0 ? 1 : 2 // program change / channel pressure: 1 byte
    if (i + len > bytes.length) break
    out.push([status, ...bytes.slice(i, i + len)])
    i += len
  }
  return out
}
