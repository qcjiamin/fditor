import { createApp } from 'vue'
import App from './App.vue'
import '@/mockjs/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

console.log(import.meta.env.VITE_API_URL)
const pinia = createPinia()
createApp(App).use(pinia).use(ElementPlus).mount('#app')
