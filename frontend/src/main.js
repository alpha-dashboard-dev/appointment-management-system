import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import { createPinia } from 'pinia'
import './styles/main.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'

createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')