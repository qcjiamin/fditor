import { EditorKey, selectedKey } from '@/constants/injectKey'
import { inject, onBeforeMount, onUnmounted, watch, type Ref } from 'vue'
import type { FabricObject } from 'fabric'

/**
 * 封装获取元素属性的逻辑
 * @param getAttrs 属性获取方法
 */
export const useGetAttrs = (getAttrs: () => void) => {
  const selectedRef = inject(selectedKey) as Ref<FabricObject>
  const editor = inject(EditorKey)
  // 组件渲染前
  onBeforeMount(() => {
    console.log('get attrs beforeMounted')
    getAttrs()
  })
  //! 元素切换后（同类元素切换，因为propertyBar不会重新渲染，因此要触发重新获取属性）
  watch(selectedRef, () => {
    console.log('get attrs selectedRef change')
    getAttrs()
  })
  const modifiedHandle = () => {
    console.log('getattrs', getAttrs)
    getAttrs()
  }
  // 卸载
  editor?.on('node:modified', modifiedHandle)
  onUnmounted(() => {
    editor?.off('node:modified', modifiedHandle)
  })
}
