// Minimal WebAudio synth for song playback and input monitoring.
// ponytail: triangle oscillator, swap for a sampled piano (soundfont) when sound quality matters.
let ctx
let master
const voices = new Map() // midi -> held voice (live input only)

function audio() {
  if (!ctx) {
    ctx = new AudioContext()
    // Compressor keeps chords from clipping.
    master = ctx.createDynamicsCompressor()
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12)

function voice(midi, velocity, start) {
  const ac = audio()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const peak = 0.3 * (velocity / 127)
  osc.type = 'triangle'
  osc.frequency.value = freq(midi)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(peak, start + 0.01)
  gain.gain.setTargetAtTime(peak * 0.35, start + 0.01, 0.4) // piano-ish decay
  osc.connect(gain).connect(master)
  osc.start(start)
  return { osc, gain }
}

function release({ osc, gain }, at) {
  gain.gain.setTargetAtTime(0, at, 0.06)
  osc.stop(at + 0.4)
}

// Call from a user gesture so the browser allows audio.
export const resume = () => audio()

// Fire-and-forget note for song playback.
export function playNote(midi, velocity, duration) {
  const now = audio().currentTime
  release(voice(midi, velocity, now), now + duration)
}

// Held notes for live input.
export function noteOn(midi, velocity) {
  noteOff(midi)
  voices.set(midi, voice(midi, velocity, audio().currentTime))
}

export function noteOff(midi) {
  const v = voices.get(midi)
  if (!v) return
  voices.delete(midi)
  release(v, ctx.currentTime)
}
