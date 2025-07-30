import type { SaveState } from '@/utils/constants'
import type { CanvasStates, ElementTypes } from '@/utils/types'
import type { TabName } from '@/views/editer/components/sidebar/types'
import type { FabricObject } from 'fabric'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
const type2Type: Record<string, ElementTypes> = {
  circle: 'Shape',
  rect: 'Shape',
  fline: 'Shape',
  frect: 'Shape',
  ftriangle: 'Shape',
  fhexagon: 'Shape',
  activeselection: 'activeselection',
  ftextbox: 'text',
  fimage: 'image'
}

// 主要用于管理画布的状态
export const useEditorStore = defineStore('editor', () => {
  const projectID = ref<number>()
  function setProjectID(val: number) {
    projectID.value = val
  }
  const projectName = ref<string>()
  function setProjectName(val: string) {
    projectName.value = val
  }

  const cvsState = ref<CanvasStates>('normal')
  function setCvsState(val: CanvasStates) {
    cvsState.value = val
  }

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
  /** 侧边栏显示的属性页 */
  const sidebarShowTab = ref<TabName>('resource')
  const setSidebarShowTab = function (val: TabName) {
    sidebarShowTab.value = val
  }
  /** 是否处于字体族加载状态 */
  const inloadingFontfamily = ref<boolean>(false)
  const setInloadingFontfamily = function (val: boolean) {
    inloadingFontfamily.value = val
  }
  const showLoginBox = ref<boolean>(false)
  const setShowLoginBox = function (val: boolean) {
    showLoginBox.value = val
  }
  /** 保存配置状态 */
  const saveState = ref<SaveState>('saved')
  const setSaveState = function (val: SaveState) {
    saveState.value = val
  }

  return {
    projectID,
    setProjectID,
    projectName,
    setProjectName,
    cvsState,
    setCvsState,
    selected,
    setSelected,
    selectType,
    inContinueModity,
    setinContinueModity,
    sidebarShowTab,
    setSidebarShowTab,
    inloadingFontfamily,
    setInloadingFontfamily,
    showLoginBox,
    setShowLoginBox,
    saveState,
    setSaveState
  }
})
