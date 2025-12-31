import type { BrushStyle, CanvasMode } from '@/types'
import type { SaveState } from '@/utils/constants'
import type { CanvasStates, ElementTypes } from '@/utils/types'
import type { TabName } from '@/views/editer/components/sidebar/types'
import type { subPenType } from '@fditor/core'
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
  fimage: 'image',
  group: 'group',
  path: 'path'
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

  const openSidebar = ref<boolean>(false)
  const setOpenSidebar = function (val: boolean) {
    openSidebar.value = val
  }
  /** 侧边栏显示的类型 */
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
  /** 舞台状态 */
  const canvasMode = ref<CanvasMode>('move')
  const setCanvasMode = function (val: CanvasMode) {
    canvasMode.value = val
  }
  /** 画笔样式 */
  const brushStyle = ref<BrushStyle>({
    brushType: 'pencil',
    lineWidth: 15,
    color: 'rgba(0,0,0,1)'
  })
  /** 修改画笔样式，单项修改 */
  const setBrushStyleByKey = <K extends keyof BrushStyle>(
    key: K,
    value: BrushStyle[K] // 泛型推导：value 必须是 key 对应属性的类型
  ) => {
    brushStyle.value = {
      ...brushStyle.value,
      [key]: value
    }
  }

  const penSubType = ref<subPenType>('pen')
  const setPenSubType = function (val: subPenType) {
    penSubType.value = val
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
    openSidebar,
    setOpenSidebar,
    inloadingFontfamily,
    setInloadingFontfamily,
    showLoginBox,
    setShowLoginBox,
    saveState,
    setSaveState,
    canvasMode,
    setCanvasMode,
    brushStyle,
    setBrushStyleByKey,
    penSubType,
    setPenSubType
  }
})
