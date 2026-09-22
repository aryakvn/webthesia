import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { demoSong, songFromMidiFile } from '@/utils/songs'
import * as synth from '@/utils/synth'

export const LEAD_IN = 2 // seconds of empty highway before the first note, so it can fall in

// Song playback clock. `time` is song time in seconds (negative during lead-in).
export const usePlayerStore = defineStore('player', () => {
  const song = shallowRef(demoSong)
  const time = ref(-LEAD_IN)
  const playing = ref(false)
  const speed = ref(1)
  const sounding = shallowRef(new Map()) // midi -> track, song notes currently under the hit line

  let raf = 0
  let last = 0

  // ponytail: scans every note each frame; fine for a few thousand notes,
  // switch to a time-indexed cursor if big files stutter.
  function seek(t) {
    time.value = t
    const next = new Map()
    for (const n of song.value.notes) {
      if (n.time <= t && t < n.time + n.duration) next.set(n.midi, n.track)
    }
    // Swap only when the set changes, so the keyboard doesn't re-render every frame.
    const prev = sounding.value
    if (next.size !== prev.size || [...next].some(([m, tr]) => prev.get(m) !== tr)) sounding.value = next
  }

  function frame(now) {
    const prev = time.value
    const t = prev + ((now - last) / 1000) * speed.value
    last = now
    for (const n of song.value.notes) {
      if (n.time > prev && n.time <= t) synth.playNote(n.midi, n.velocity, n.duration / speed.value)
    }
    seek(t)
    if (t >= song.value.duration) return pause()
    raf = requestAnimationFrame(frame)
  }

  function play() {
    if (playing.value) return
    if (time.value >= song.value.duration) seek(-LEAD_IN)
    synth.resume()
    playing.value = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function pause() {
    playing.value = false
    cancelAnimationFrame(raf)
  }

  const toggle = () => (playing.value ? pause() : play())
  const restart = () => seek(-LEAD_IN)

  async function load(file) {
    const next = await songFromMidiFile(file)
    pause()
    song.value = next
    restart()
  }

  return { song, time, playing, speed, sounding, play, pause, toggle, seek, restart, load }
})
