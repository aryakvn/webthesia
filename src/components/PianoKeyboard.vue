<script setup>
import { computed } from 'vue'
import { keyLayout, trackColor } from '@/utils/keyboardLayout'
import { useInputStore } from '@/stores/input'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  low: { type: Number, default: 21 }, // A0
  high: { type: Number, default: 108 }, // C8
})

const input = useInputStore()
const player = usePlayerStore()

// Whites first so black keys stack on top (DOM order = paint order).
const keys = computed(() => {
  const all = keyLayout(props.low, props.high)
  return [...all.filter((k) => !k.black), ...all.filter((k) => k.black)]
})

// Lit color: green-gold "hit" when you play a note the song wants,
// your own color when freelancing, the track color when the song plays it.
function keyStyle(k) {
  const track = player.sounding.get(k.midi)
  const held = input.pressed.has(k.midi)
  const lit = held && track !== undefined ? 'var(--hit)' : held ? 'var(--held)' : track !== undefined ? trackColor(track, k.black) : null
  return { left: `${k.x * 100}%`, width: `${k.w * 100}%`, '--lit': lit }
}

// Mouse/touch play. Track pointer-held notes so hovering off a key
// doesn't release the same note held on a MIDI device.
const pointerHeld = new Set()
function press(midi) {
  pointerHeld.add(midi)
  input.noteOn(midi, 100)
}
function release(midi) {
  if (pointerHeld.delete(midi)) input.noteOff(midi)
}
</script>

<template>
  <div class="keyboard" role="img" aria-label="Piano keyboard" @contextmenu.prevent>
    <div
      v-for="k in keys"
      :key="k.midi"
      class="key"
      :class="{ black: k.black, lit: keyStyle(k)['--lit'] }"
      :style="keyStyle(k)"
      @pointerdown.prevent="press(k.midi)"
      @pointerup="release(k.midi)"
      @pointerleave="release(k.midi)"
      @pointercancel="release(k.midi)"
    >
      <span v-if="k.midi % 12 === 0" class="label">C{{ k.midi / 12 - 1 }}</span>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  position: relative;
  height: 100%;
  touch-action: none;
  user-select: none;
  background: var(--bg);
}
.key {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 0 0 5px 5px;
  background: linear-gradient(#e7e5e4, #fafaf9 80%, #d6d3d1);
  box-shadow: inset -1px 0 0 #a8a29e, inset 0 -4px 0 #d6d3d1;
  cursor: pointer;
  transition: background 90ms, transform 90ms, box-shadow 90ms;
  transform-origin: top;
}
.key:hover {
  background: linear-gradient(#e7e5e4, #fff 80%, #e7e5e4);
}
.key.black {
  bottom: 36%;
  z-index: 1;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(#1c1917, #44403c 92%, #292524);
  box-shadow: inset 0 -5px 0 #0c0a09, 0 2px 3px rgb(0 0 0 / 0.5);
}
.key.black:hover {
  background: linear-gradient(#292524, #57534e 92%, #292524);
}
.key.lit {
  background: var(--lit);
  box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.25), 0 0 18px var(--lit);
  transform: scaleY(0.985);
}
.label {
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
  font-size: 10px;
  color: #78716c;
  pointer-events: none;
}
</style>
