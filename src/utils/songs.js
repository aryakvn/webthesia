// Song shape used across the app:
// { name, tracks: [trackName], duration, notes: [{ midi, time, duration, velocity, track }] }
// time/duration in seconds, velocity 0..127, notes sorted by time.

const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

// "E4 D4:0.5 C4:2" -> notes; ":n" is length in beats (default 1).
function line(str, track, beat) {
  let t = 0
  return str.split(/\s+/).map((tok) => {
    const [, letter, octave, beats = '1'] = tok.match(/^([A-G])(\d):?([\d.]+)?$/)
    const note = {
      midi: 12 * (+octave + 1) + STEP[letter],
      time: t * beat,
      duration: +beats * beat * 0.95,
      velocity: 90,
      track,
    }
    t += +beats
    return note
  })
}

function build(name, lines, bpm) {
  const beat = 60 / bpm
  const notes = lines.flatMap((l, i) => line(l, i, beat)).sort((a, b) => a.time - b.time)
  const duration = notes.reduce((m, n) => Math.max(m, n.time + n.duration), 0)
  return { name, tracks: ['Right hand', 'Left hand'], notes, duration }
}

export const demoSong = build(
  'Ode to Joy (demo)',
  [
    'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2 ' +
      'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2',
    'C3:4 G2:4 C3:4 G2:4 C3:4 G2:4 C3:4 G2:2 C3:2',
  ],
  100,
)

// Parse a .mid/.midi File. Percussion and empty tracks are dropped.
export async function songFromMidiFile(file) {
  const { Midi } = await import('@tonejs/midi')
  const midi = new Midi(await file.arrayBuffer())
  const tracks = midi.tracks.filter((t) => t.notes.length && !t.instrument.percussion)
  const notes = tracks
    .flatMap((t, track) =>
      t.notes.map((n) => ({
        midi: n.midi,
        time: n.time,
        duration: n.duration,
        velocity: Math.round(n.velocity * 127),
        track,
      })),
    )
    .sort((a, b) => a.time - b.time)
  if (!notes.length) throw new Error('No playable notes in this file.')
  return {
    name: midi.name || file.name.replace(/\.midi?$/i, ''),
    tracks: tracks.map((t, i) => t.name || t.instrument.name || `Track ${i + 1}`),
    notes,
    duration: notes.reduce((m, n) => Math.max(m, n.time + n.duration), 0),
  }
}
