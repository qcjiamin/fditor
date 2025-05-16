import { EditorKey } from '@/constants/injectKey'
import { inject, onBeforeMount, onUnmounted, watch } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

/**
 * 封装获取元素属性的逻辑
 * @param getAttrs 属性获取方法
 */
export const useGetAttrs = (getAttrs: () => void) => {
  const editorStore = useEditorStore()

  const editor = inject(EditorKey)
  // 组件渲染前
  onBeforeMount(() => {
    getAttrs()
  })
  //! 元素切换后（同类元素切换，因为propertyBar不会重新渲染，因此要触发重新获取属性）
  watch(
    () => editorStore.selected,
    () => {
      console.log('selectedchange getattrs')
      getAttrs()
    }
  )
  const modifiedHandle = () => {
    console.log('modify getattrs', getAttrs)
    getAttrs()
  }
  // 卸载
  editor?.on('node:modified', modifiedHandle)
  onUnmounted(() => {
    editor?.off('node:modified', modifiedHandle)
  })
}
