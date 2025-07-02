// src/main.js
import './assets/main.css' // Make sure this line is present

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'

// NEW: Import Toastification and its CSS
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css"; // The CSS for the toasts

const app = createApp(App)

app.use(createPinia())

// NEW: Configure and use Toastification
const options = {
    // You can set default options here
    position: POSITION.TOP_RIGHT, // Toasts appear at the top right
    timeout: 3000, // Disappear after 3 seconds
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};
app.use(Toast, options); // Use the plugin with your options

app.mount('#app')