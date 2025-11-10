import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import axios from 'axios'
import { usuarioStore } from './stores/usuario'

axios.defaults.baseURL = 'http://localhost:8080'

axios.interceptors.request.use((config) => {
  const store = usuarioStore()
  if (store.token) {
    config.headers.Authorization = store.token
  }
  return config
})

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

app.use(router)

app.mount('#app')
