import type { ElementTypes } from '@/utils/types'
import type { FabricObject } from 'fabric'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
const type2Type: Record<string, ElementTypes> = {
  circle: 'Shape',
  rect: 'Shape',
  activeselection: 'activeselection'
}

// 主要用于管理画布的状态
export const useEditorStore = defineStore('editor', () => {
  const selected = ref<FabricObject | undefined>(undefined)
  function setSelected(val: FabricObject | undefined) {
    selected.value = val
  }
  const selectType = computed(() => {
    if (!selected.value) {
      return 'bg'
    } else {
      return type2Type[selected.value.type] as ElementTypes
    }
  })
  const inContinueModity = ref<boolean>(false)
  const setinContinueModity = function (val: boolean) {
    inContinueModity.value = val
  }
  return {
    selected,
    setSelected,
    selectType,
    inContinueModity,
    setinContinueModity
  }
})
