import { eventBus } from '@/events/eventBus'
import type { Command, UndoableStates } from '@/stores/type'
import type { BrushStyle, CanvasMode } from '@/types'
import type { SaveState } from '@/utils/constants'
import { isError } from '@/utils/typeHelper'
import type { CanvasStates, ElementTypes } from '@/utils/types'
import type { TabName } from '@/views/editer/components/sidebar/types'
import type { subPenType } from '@fditor/core'
import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { computed, reactive, ref } from 'vue'
import type Editor from '../../../packages/core/Editor'
import { cloneDeep } from 'lodash'
// import { undoableStates } from './undoableStates'

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
  path: 'path',
  fpenpath: 'fpenpath'
}

// 主要用于管理画布的状态
export const useEditorStore = defineStore('editor', () => {
  const editor = shallowRef<Editor | null>(null)
  function setEditor(_editor: Editor) {
    editor.value = _editor
  }

  const undoableStates = reactive<UndoableStates>({
    selectedIds: [],
    fillColor: '#ffffff',
    strokeColor: '#000000'
  })
  function setUndoableStates(val: Partial<UndoableStates>) {
    Object.assign(undoableStates, val)
  }
  function setSelected(ids: string[]) {
    undoableStates.selectedIds = cloneDeep(ids)
  }

  const commandStack = ref<Command[]>([])
  const currentIndex = ref(-1)
  const maxHistory = ref(50)
  const canUndo = computed(() => currentIndex.value >= 0)
  const canRedo = computed(() => currentIndex.value < commandStack.value.length - 1)

  const selected = computed(() => {
    if (!editor.value) return null
    const canvas = editor.value.stage
    if (!undoableStates.selectedIds.length || !canvas) return null
    const id = undoableStates.selectedIds[0]
    if (undoableStates.selectedIds.length === 1) {
      return canvas.getObjectById(id)
    } else {
      // activeSelection
      const obj = canvas.getObjectById(id)
      if (!obj) return null
      const group = obj.group
      return group
    }
  })

  const takeSnapshot = () => ({ ...undoableStates })
  const restoreSnapshot = (snap: UndoableStates) => Object.assign(undoableStates, snap)
  /** 内部状态：是否正在执行命令（用于拦截副作用命令入栈） */
  const isHistoryLocked = ref(false)

  /** 注册命令，并执行do */
  const registerCommand = async (command: Command, immediately: boolean = true) => {
    // ------ 情况1：如果处于历史锁定期（即正在执行父命令），直接执行子命令但不入栈 ------
    // if (isHistoryLocked.value) {
    //   // 直接执行副作用命令（例如 setSelect），不记录历史，不触发保存
    //   try {
    //     await command.do()
    //     console.log('⚡ 拦截副作用命令不入栈:', command)
    //   } catch (error) {
    //     // 副作用执行失败，通常不应中断主流程，但需记录
    //     console.warn('⚡ 副作用命令执行失败:', error)
    //   }
    //   return // 直接返回，不走后续入栈逻辑
    // }
    if (isHistoryLocked.value) {
      console.log('⚡ 拦截副作用命令不入栈:', command)
      return
    }

    // ------ 情况2：正常执行主命令 ------
    // 1. 上锁：标记开始执行
    isHistoryLocked.value = true

    // 2. 执行前准备：截断redo脏命令、生成快照
    let isExecSuccess = false
    const preExecuteSnapshot = takeSnapshot()
    if (currentIndex.value < commandStack.value.length - 1) {
      commandStack.value = commandStack.value.slice(0, currentIndex.value + 1)
    }

    try {
      if (immediately) {
        // 3. 执行命令的do方法
        await command.do()
      }
      isExecSuccess = true
    } catch (error) {
      // 4. 捕获异常与回滚
      isExecSuccess = false
      console.error(`【命令执行失败】`, isError(error) ? error.message : error, command)
      restoreSnapshot(preExecuteSnapshot)
      throw new Error(`操作失败：${isError(error) ? error.message : error}`)
    } finally {
      // 5. 解锁：无论成功失败，必须释放锁
      isHistoryLocked.value = false

      // 6. 成功入栈
      if (isExecSuccess) {
        commandStack.value.push(command)
        console.log('push commandStack', commandStack.value, command)
        if (commandStack.value.length > maxHistory.value) commandStack.value.shift()
        currentIndex.value = commandStack.value.length - 1
        eventBus.emit('config:save', 2000)
      }
    }
  }
  const undo = async () => {
    if (!canUndo.value) return
    // 锁定历史栈
    isHistoryLocked.value = true
    const cmd = commandStack.value[currentIndex.value]
    let isExecSuccess = false
    try {
      await cmd.undo()
      isExecSuccess = true
    } catch (error) {
      isExecSuccess = false
      console.error(`【撤销失败】`, error)
    } finally {
      if (isExecSuccess) {
        eventBus.emit('config:save', 2000)
      }
      // 解锁
      isHistoryLocked.value = false
    }
    currentIndex.value--
  }
  const redo = async () => {
    if (!canRedo.value) return

    currentIndex.value++
    const cmd = commandStack.value[currentIndex.value]
    // 锁定历史栈
    isHistoryLocked.value = true
    let isExecSuccess = false
    try {
      await cmd.do()
      isExecSuccess = true
    } catch (error) {
      isExecSuccess = false
      console.error(`【重做失败】`, error)
    } finally {
      if (isExecSuccess) {
        eventBus.emit('config:save', 2000)
      }
      // 解锁
      isHistoryLocked.value = false
    }
  }

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

  // const selected = ref<FabricObject | undefined>(undefined)
  // function setSelected(val: FabricObject | undefined) {
  //   selected.value = val
  // }
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

  // todo 将历史记录功能提取出来，放入单独模块
  /** 保存变换前元素的几何属性 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originProps = ref<Record<string, any>[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setOriginProps(val: Record<string, any>[]) {
    originProps.value = val
  }

  return {
    projectID,
    setProjectID,
    projectName,
    setProjectName,
    cvsState,
    setCvsState,
    selected,
    setUndoableStates,
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
    setPenSubType,
    undoableStates,
    canUndo,
    canRedo,
    takeSnapshot,
    restoreSnapshot,
    registerCommand,
    undo,
    redo,
    isHistoryLocked,
    setEditor,
    originProps,
    setOriginProps
  }
})
