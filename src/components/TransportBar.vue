<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

// Self-contained: song loading, play/pause, seek and speed against the player store.
const player = usePlayerStore()
const fileInput = ref()
const error = ref('')

async function onFile(e) {
  const file = e.target.files[0]
  e.target.value = '' // allow re-picking the same file
  if (!file) return
  error.value = ''
  try {
    await player.load(file)
  } catch (err) {
    error.value = `Couldn't read MIDI file: ${err.message}`
  }
}

const fmt = (s) => {
  s = Math.max(0, s)
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
</script>

<template>
  <div class="transport">
    <button class="btn play" :aria-label="player.playing ? 'Pause' : 'Play'" @click="player.toggle">
      {{ player.playing ? '❚❚' : '▶' }}
    </button>
    <button class="btn" aria-label="Restart" @click="player.restart">⟲</button>

    <div class="song">
      <span class="name" :title="player.song.name">{{ player.song.name }}</span>
      <input
        class="seek"
        type="range"
        min="0"
        :max="player.song.duration"
        step="0.01"
        :value="Math.max(0, player.time)"
        aria-label="Seek"
        @input="player.seek(+$event.target.value)"
      />
      <span class="time">{{ fmt(player.time) }} / {{ fmt(player.song.duration) }}</span>
    </div>

    <select v-model.number="player.speed" class="btn" aria-label="Speed">
      <option v-for="s in [0.25, 0.5, 0.75, 1, 1.25, 1.5]" :key="s" :value="s">{{ s }}×</option>
    </select>
    <button class="btn" @click="fileInput.click()">Open MIDI…</button>
    <input ref="fileInput" type="file" accept=".mid,.midi,audio/midi" hidden @change="onFile" />
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.transport {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.play {
  width: 40px;
  font-size: 14px;
}
.song {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 480px;
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  grid-column: 1 / -1;
  font-weight: 600;
  font-size: 14px;
}
.time {
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--muted);
}
.seek {
  width: 100%;
  accent-color: var(--held);
}
.error {
  margin: 0;
  color: #fca5a5;
  font-size: 13px;
}
</style>
