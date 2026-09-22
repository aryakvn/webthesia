import { onBeforeUnmount, ref } from 'vue'
import { findMidiIn, usbMidiPackets } from '@/utils/midi'

// Minimal USB-MIDI driver over WebUSB: claims the device's MIDI IN endpoint and
// reads USB-MIDI event packets. See docs/midi-input.md for when this works
// (vendor-specific interfaces, WinUSB driver) and when WebMIDI is needed instead.
export function useWebUsbMidi(onMessage) {
  const supported = 'usb' in navigator
  const devices = ref([]) // [{ id, name }]
  const error = ref('')
  const open = new Set()
  let nextId = 0

  function explain(e) {
    if (e.name === 'SecurityError')
      return 'Browser blocks WebUSB for standard (audio-class) USB-MIDI devices. They work through WebMIDI instead.'
    if (e.name === 'NetworkError')
      return 'Device is held by the OS driver or another tab. On Windows, WebUSB needs the WinUSB driver (e.g. via Zadig).'
    return e.message
  }

  async function read(device, endpoint) {
    try {
      while (device.opened) {
        const r = await device.transferIn(endpoint.endpointNumber, endpoint.packetSize)
        if (!r.data) continue
        const bytes = new Uint8Array(r.data.buffer, r.data.byteOffset, r.data.byteLength)
        for (const msg of usbMidiPackets(bytes)) onMessage(msg)
      }
    } catch {
      // Unplugged or closed: fall through to cleanup.
    }
  }

  async function connect() {
    error.value = ''
    let device
    try {
      device = await navigator.usb.requestDevice({ filters: [] })
    } catch {
      return // chooser dismissed
    }
    let midiIn
    try {
      await device.open()
      if (!device.configuration) await device.selectConfiguration(1)
      midiIn = findMidiIn(device.configuration)
      if (!midiIn) throw new Error('No USB-MIDI input endpoint found on this device.')
      await device.claimInterface(midiIn.interfaceNumber)
      if (midiIn.alternateSetting) await device.selectAlternateInterface(midiIn.interfaceNumber, midiIn.alternateSetting)
    } catch (e) {
      error.value = explain(e)
      if (device.opened) device.close().catch(() => {})
      return
    }
    const entry = { id: ++nextId, name: device.productName || 'USB device' }
    devices.value = [...devices.value, entry]
    open.add(device)
    await read(device, midiIn.endpoint)
    open.delete(device)
    devices.value = devices.value.filter((d) => d.id !== entry.id)
  }

  onBeforeUnmount(() => {
    for (const d of open) d.close().catch(() => {})
  })

  return { supported, devices, error, connect }
}
