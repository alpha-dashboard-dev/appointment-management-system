// Application entry point
// Creates the Vue app instance, registers the router plugin, and mounts it to #app in index.html
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css' // Global styles

createApp(App).use(router).mount('#app')
