import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import { createPinia } from 'pinia'
import './styles/main.css'

createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')