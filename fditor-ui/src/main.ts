import { createApp } from 'vue'
import App from './App.vue'
import '@/mockjs/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { loadImage } from '@/utils/common'
import Editor from '../../packages/core/Editor'
import { controlsUtils } from 'fabric'

controlsUtils.createObjectDefaultControls()
const rotate = await loadImage('./images/rotate.svg')
Editor.setControlInfo('mtr', {
  img: rotate,
  w: 20,
  h: 20
})

const pinia = createPinia()

createApp(App).use(pinia).use(ElementPlus).mount('#app')
