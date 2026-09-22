<script setup>
import { computed, onMounted } from 'vue'
import { useWebMidi } from '@/composables/useWebMidi'
import { useWebUsbMidi } from '@/composables/useWebUsbMidi'
import { useInputStore } from '@/stores/input'

// Self-contained: connects input devices and feeds them into the input store.
const input = useInputStore()
const midi = useWebMidi(input.handleMidi)
const usb = useWebUsbMidi(input.handleMidi)

const devices = computed(() => [
  ...midi.devices.value.map((d) => ({ key: `midi-${d.id}`, name: d.name, via: 'MIDI' })),
  ...usb.devices.value.map((d) => ({ key: `usb-${d.id}`, name: d.name, via: 'USB' })),
])
const error = computed(() => midi.error.value || usb.error.value)

onMounted(midi.connect)
</script>

<template>
  <div class="picker">
    <TransitionGroup name="chip" tag="div" class="chips">
      <span v-for="d in devices" :key="d.key" class="chip" :title="`Connected via Web${d.via}`">
        <i class="dot" />{{ d.name }}<small>{{ d.via }}</small>
      </span>
      <span v-if="!devices.length" key="none" class="chip muted">
        {{ midi.supported ? 'No MIDI device' : 'WebMIDI unsupported' }}
      </span>
    </TransitionGroup>
    <button v-if="usb.supported" class="btn" @click="usb.connect">Connect USB…</button>
    <label class="toggle" title="Play your input through the built-in synth">
      <input v-model="input.sound" type="checkbox" /> Input sound
    </label>
    <Transition name="fade">
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.picker {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--surface-2);
  font-size: 13px;
}
.chip small {
  color: var(--muted);
  font-size: 10px;
}
.chip.muted {
  color: var(--muted);
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--held);
  box-shadow: 0 0 8px var(--held);
}
.toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
}
.error {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;
  max-width: 360px;
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: #7f1d1d;
  font-size: 13px;
}
.chip-enter-active,
.chip-leave-active,
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms, transform 200ms;
}
.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
