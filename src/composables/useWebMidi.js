import { onBeforeUnmount, ref } from 'vue'

// Listens to every connected WebMIDI input at once (no device picking needed),
// re-binding when devices are plugged in or out. onMessage gets raw MIDI bytes.
export function useWebMidi(onMessage) {
  const supported = 'requestMIDIAccess' in navigator
  const devices = ref([]) // [{ id, name }]
  const error = ref('')
  let access

  function bind() {
    const list = []
    for (const input of access.inputs.values()) {
      if (input.state !== 'connected') continue
      input.onmidimessage = (e) => onMessage(e.data)
      list.push({ id: input.id, name: input.name })
    }
    devices.value = list
  }

  async function connect() {
    if (!supported) return
    error.value = ''
    try {
      access = await navigator.requestMIDIAccess()
      access.onstatechange = bind
      bind()
    } catch (e) {
      error.value = `MIDI access denied: ${e.message}`
    }
  }

  onBeforeUnmount(() => {
    if (!access) return
    access.onstatechange = null
    for (const input of access.inputs.values()) input.onmidimessage = null
  })

  return { supported, devices, error, connect }
}
