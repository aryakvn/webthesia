import { onBeforeUnmount, onMounted, ref } from 'vue'

// Two piano rows, tracker/DAW style. Values are semitones above the base C.
// Keyed by KeyboardEvent.code so the mapping is layout-independent.
const LAYOUT = {
  KeyZ: 0, KeyS: 1, KeyX: 2, KeyD: 3, KeyC: 4, KeyV: 5, KeyG: 6, KeyB: 7,
  KeyH: 8, KeyN: 9, KeyJ: 10, KeyM: 11, Comma: 12, KeyL: 13, Period: 14, Slash: 16,
  KeyQ: 12, Digit2: 13, KeyW: 14, Digit3: 15, KeyE: 16, KeyR: 17, Digit5: 18, KeyT: 19,
  Digit6: 20, KeyY: 21, Digit7: 22, KeyU: 23, KeyI: 24, Digit9: 25, KeyO: 26, KeyP: 28,
}

// Play with the computer keyboard: no MIDI hardware needed.
// Minus/Equal shift the octave. onMessage gets raw MIDI bytes, same as the
// WebMIDI and WebUSB composables, so it exercises the identical code path.
export function useComputerKeyboard(onMessage) {
  const octave = ref(3) // base C of the lower row: C3 = MIDI 48
  const held = new Map() // code -> midi, so a note is released at the pitch it started

  const note = (code) => 12 * (octave.value + 1) + LAYOUT[code]

  function down(e) {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return
    if (e.target instanceof Element && e.target.closest('input, select, textarea')) return
    if (e.code === 'Minus' || e.code === 'Equal') {
      octave.value = Math.min(7, Math.max(0, octave.value + (e.code === 'Equal' ? 1 : -1)))
      return
    }
    if (!(e.code in LAYOUT) || held.has(e.code)) return
    e.preventDefault()
    const midi = note(e.code)
    held.set(e.code, midi)
    onMessage([0x90, midi, 100])
  }

  function up(e) {
    const midi = held.get(e.code)
    if (midi === undefined) return
    held.delete(e.code)
    onMessage([0x80, midi, 0])
  }

  // Releasing keys while the window is unfocused never reaches us: drop everything.
  function panic() {
    for (const midi of held.values()) onMessage([0x80, midi, 0])
    held.clear()
  }

  onMounted(() => {
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', panic)
  })
  onBeforeUnmount(() => {
    panic()
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', panic)
  })

  return { octave }
}
