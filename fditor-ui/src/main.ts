import { createApp } from 'vue'
import App from './App.vue'
import '@/mockjs/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { FCanvas } from '../../packages/core/customShape/FCanvas'

const pinia = createPinia()
FCanvas.resetControls({
  mtr: {
    imgurl: './images/rotate.svg'
  }
}).then(() => {
  createApp(App).use(pinia).use(ElementPlus).mount('#app')
})
