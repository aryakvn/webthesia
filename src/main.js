import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useInputStore } from './stores/input'
import { usePlayerStore } from './stores/player'
import './style.css'

const pinia = createPinia()
createApp(App).use(pinia).mount('#app')

// Dev-only console handle for testing without hardware, e.g.
//   webthesia.input.handleMidi([0x90, 60, 100])   // note on
// See docs/midi-input.md.
if (import.meta.env.DEV) {
  window.webthesia = { input: useInputStore(pinia), player: usePlayerStore(pinia) }
}
