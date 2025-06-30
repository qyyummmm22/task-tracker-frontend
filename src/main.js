// src/main.js
import './assets/main.css' // Make sure this line is present

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')