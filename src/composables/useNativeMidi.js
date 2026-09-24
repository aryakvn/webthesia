import { registerPlugin } from '@capacitor/core'
import { onBeforeUnmount, ref } from 'vue'
import { splitMidiMessages } from '@/utils/midi'

// MIDI input inside the iOS/Android app, whose web views have no WebMIDI. Same shape as
// useWebMidi. The plugin is in-repo: android/.../NativeMidiPlugin.java and
// ios/App/App/NativeMidiPlugin.swift. It sends raw packets; they can hold several messages.
const NativeMidi = registerPlugin('NativeMidi')

export function useNativeMidi(onMessage) {
  const devices = ref([]) // [{ id, name }]
  const error = ref('')
  const listeners = []

  async function connect() {
    error.value = ''
    try {
      listeners.push(
        await NativeMidi.addListener('midi', ({ data }) => splitMidiMessages(data).forEach(onMessage)),
        await NativeMidi.addListener('devices', (e) => (devices.value = e.devices)),
      )
      devices.value = (await NativeMidi.start()).devices
    } catch (e) {
      error.value = `MIDI unavailable: ${e.message}`
    }
  }

  onBeforeUnmount(() => listeners.forEach((l) => l.remove()))

  return { supported: true, devices, error, connect }
}
