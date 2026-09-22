<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import MidiDevicePicker from '@/components/MidiDevicePicker.vue'
import NoteHighway from '@/components/NoteHighway.vue'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import TransportBar from '@/components/TransportBar.vue'
import { usePlayerStore } from '@/stores/player'

// Keyboard range shared by highway and keyboard so columns line up.
const LOW = 21 // A0
const HIGH = 108 // C8

const player = usePlayerStore()

// Space toggles playback, unless a control has focus (it handles space itself).
function onKey(e) {
  if (e.code !== 'Space' || e.target.closest('button, input, select')) return
  e.preventDefault()
  player.toggle()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="app">
    <header class="bar">
      <h1 class="logo">webthesia</h1>
      <TransportBar />
      <MidiDevicePicker />
    </header>
    <main class="stage">
      <NoteHighway :low="LOW" :high="HIGH" />
    </main>
    <footer class="keys">
      <PianoKeyboard :low="LOW" :high="HIGH" />
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr clamp(110px, 22vh, 200px);
  height: 100dvh;
}
.bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.logo {
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, var(--held), #60a5fa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stage {
  min-height: 0;
}
/* Hit line: where falling notes meet the keys. */
.keys {
  border-top: 3px solid #a78bfa;
  box-shadow: 0 -4px 20px rgb(167 139 250 / 0.5);
}
</style>
