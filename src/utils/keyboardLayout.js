const BLACK = new Set([1, 3, 6, 8, 10])

export const isBlack = (midi) => BLACK.has(midi % 12)

// Horizontal geometry of keys low..high as fractions (0..1) of the full width.
// Shared by the DOM keyboard and the canvas highway so notes line up with keys.
// Index with keys[midi - low]. low/high should be white keys.
export function keyLayout(low, high) {
  let whites = 0
  for (let m = low; m <= high; m++) if (!isBlack(m)) whites++
  const ww = 1 / whites
  const bw = ww * 0.6
  const keys = []
  let wi = 0
  for (let m = low; m <= high; m++) {
    if (isBlack(m)) keys.push({ midi: m, black: true, x: wi * ww - bw / 2, w: bw })
    else keys.push({ midi: m, black: false, x: wi++ * ww, w: ww })
  }
  return keys
}

const PALETTE = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf']
const PALETTE_DARK = ['#16a34a', '#2563eb', '#db2777', '#d97706', '#7c3aed', '#0d9488']

// Synthesia convention: track 0 green (right hand), track 1 blue (left hand).
// Notes on black keys get the darker shade.
export const trackColor = (track, black) =>
  (black ? PALETTE_DARK : PALETTE)[track % PALETTE.length]
