import { selectedKey } from '@/constants/injectKey'
import { inject, onBeforeMount, watch, type Ref } from 'vue'
import type { FabricObject } from 'fabric'

/**
 * 封装获取元素属性的逻辑
 * @param getAttrs 属性获取方法
 */
export const useGetAttrs = (getAttrs: () => void) => {
  const selectedRef = inject(selectedKey) as Ref<FabricObject>
  // 组件渲染前
  onBeforeMount(() => {
    getAttrs()
  })
  // 元素切换后
  watch(selectedRef, () => {
    console.log('change selected')
    getAttrs()
  })
}
