import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { parseMidiMessage } from '@/utils/midi'
import * as synth from '@/utils/synth'

// Notes the player is holding right now, from any source (WebMIDI, WebUSB, mouse/touch).
// Every input source funnels into noteOn/noteOff or handleMidi, so the rest of the app
// never cares where a note came from.
export const useInputStore = defineStore('input', () => {
  const pressed = reactive(new Map()) // midi -> velocity
  const sound = ref(true) // monitor input through the synth; turn off for keyboards with speakers

  function noteOn(note, velocity = 100) {
    pressed.set(note, velocity)
    if (sound.value) synth.noteOn(note, velocity)
  }

  function noteOff(note) {
    pressed.delete(note)
    synth.noteOff(note)
  }

  function handleMidi(bytes) {
    const e = parseMidiMessage(bytes)
    if (!e) return
    if (e.on) noteOn(e.note, e.velocity)
    else noteOff(e.note)
  }

  return { pressed, sound, noteOn, noteOff, handleMidi }
})
