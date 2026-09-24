import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findMidiIn, parseMidiMessage, splitMidiMessages, usbMidiPackets } from '../src/utils/midi.js'
import { keyLayout } from '../src/utils/keyboardLayout.js'

test('parseMidiMessage', () => {
  assert.deepEqual(parseMidiMessage([0x90, 60, 100]), { on: true, note: 60, velocity: 100 })
  assert.deepEqual(parseMidiMessage([0x93, 60, 0]), { on: false, note: 60, velocity: 0 }) // vel 0 = off, any channel
  assert.deepEqual(parseMidiMessage([0x80, 61, 64]), { on: false, note: 61, velocity: 0 })
  assert.equal(parseMidiMessage([0xb0, 64, 127]), null) // CC ignored
})

test('usbMidiPackets keeps channel messages, drops others and partial packets', () => {
  const bytes = [0x09, 0x90, 60, 100, 0x0f, 0xf8, 0, 0, 0x18, 0x80, 60, 0, 0x09, 0x90]
  assert.deepEqual(usbMidiPackets(bytes), [[0x90, 60, 100], [0x80, 60, 0]])
})

test('splitMidiMessages: several messages, running status, SysEx and real-time dropped', () => {
  const bytes = [0x90, 60, 100, 62, 90, 0xf8, 0xc0, 5, 0xf0, 1, 2, 3, 0xf7, 0x80, 60, 0, 0x90, 64]
  assert.deepEqual(splitMidiMessages(bytes), [[0x90, 60, 100], [0x90, 62, 90], [0xc0, 5], [0x80, 60, 0]])
  assert.deepEqual(splitMidiMessages([0x90, 60, 100]), [[0x90, 60, 100]])
})

test('findMidiIn prefers MIDIStreaming over vendor interface', () => {
  const bulkIn = { direction: 'in', type: 'bulk', endpointNumber: 1, packetSize: 64 }
  const iface = (n, cls, sub) => ({
    interfaceNumber: n,
    alternates: [{ alternateSetting: 0, interfaceClass: cls, interfaceSubclass: sub, endpoints: [bulkIn] }],
  })
  assert.equal(findMidiIn({ interfaces: [iface(0, 0xff, 0), iface(1, 1, 3)] }).interfaceNumber, 1)
  assert.equal(findMidiIn({ interfaces: [iface(0, 0xff, 0)] }).interfaceNumber, 0)
  assert.equal(findMidiIn({ interfaces: [iface(0, 3, 0)] }), undefined)
})

test('keyLayout: 88 keys, 52 whites spanning full width', () => {
  const keys = keyLayout(21, 108)
  assert.equal(keys.length, 88)
  const whites = keys.filter((k) => !k.black)
  assert.equal(whites.length, 52)
  const last = whites.at(-1)
  assert.ok(Math.abs(last.x + last.w - 1) < 1e-9)
  assert.ok(keys[1].black && keys[1].x > keys[0].x) // A#0 sits over A0/B0 seam
})
