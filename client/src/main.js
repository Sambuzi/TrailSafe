// Entry point: crea e monta l'app Vue, registra il router.
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
