<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { keyLayout, trackColor } from '@/utils/keyboardLayout'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  low: { type: Number, default: 21 },
  high: { type: Number, default: 108 },
  seconds: { type: Number, default: 3 }, // song time visible above the hit line
})

const player = usePlayerStore()
const canvas = ref()
const keys = computed(() => keyLayout(props.low, props.high))
let raf = 0
let ro

// Canvas instead of DOM: hundreds of moving rects per frame.
function draw() {
  const c = canvas.value
  const ctx = c.getContext('2d')
  const W = c.width
  const H = c.height
  const dpr = devicePixelRatio
  const pps = H / props.seconds
  const t = player.time
  const ks = keys.value

  ctx.clearRect(0, 0, W, H)

  // Octave guides at every C.
  ctx.fillStyle = 'rgb(255 255 255 / 0.06)'
  for (const k of ks) if (k.midi % 12 === 0) ctx.fillRect(Math.round(k.x * W), 0, dpr, H)

  // ponytail: draws by scanning all notes; add a time cursor if large files drop frames.
  for (const n of player.song.notes) {
    const bottom = H - (n.time - t) * pps
    const top = H - (n.time + n.duration - t) * pps
    if (bottom < 0 || top > H) continue
    const k = ks[n.midi - props.low]
    if (!k) continue
    const color = trackColor(n.track, k.black)
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = n.time <= t ? 16 * dpr : 0 // glow while sounding
    ctx.beginPath()
    ctx.roundRect(k.x * W + dpr, top, Math.max(k.w * W - 2 * dpr, 2), bottom - top, 4 * dpr)
    ctx.fill()
  }
  ctx.shadowBlur = 0

  raf = requestAnimationFrame(draw)
}

function resize() {
  const c = canvas.value
  c.width = c.clientWidth * devicePixelRatio
  c.height = c.clientHeight * devicePixelRatio
}

onMounted(() => {
  ro = new ResizeObserver(resize)
  ro.observe(canvas.value)
  resize()
  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="highway" aria-hidden="true" />
</template>

<style scoped>
.highway {
  display: block;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at bottom, #1e1b2e, var(--bg) 70%);
}
</style>
