import { eventBus } from '@/events/eventBus'
import type { Command, UndoableStates } from '@/stores/type'
import type { BrushStyle, CanvasMode } from '@/types'
import type { SaveState } from '@/utils/constants'
import { isError } from '@/utils/typeHelper'
import type { CanvasStates, ElementTypes } from '@/utils/types'
import type { TabName } from '@/views/editer/components/sidebar/types'
import type { subPenType } from '@fditor/core'
import type { FabricObject } from 'fabric'
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
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
  // const editor = inject(EditorKey) as Editor
  // const canvas = editor.stage

  const undoableStates: UndoableStates = reactive({
    selectedId: '',
    fillColor: '#ffffff',
    strokeColor: '#000000'
  })

  const commandStack = ref<Command[]>([])
  const currentIndex = ref(-1)
  const maxHistory = ref(50)
  const canUndo = computed(() => currentIndex.value >= 0)
  const canRedo = computed(() => currentIndex.value < commandStack.value.length - 1)

  watch(canUndo, (canUndo) => {
    console.log('canUndo change', canUndo)
  })

  // todo 选中的元素只标记id。命令中不能保存深拷贝的对象
  // const selected = computed(() => {
  //   if (!undoableStates.selectedId || !canvas) return undefined
  //   return canvas.getObjects().find((obj) => obj.id === undoableStates.selectedId)
  // })

  const takeSnapshot = () => ({ ...undoableStates })
  const restoreSnapshot = (snap: UndoableStates) => Object.assign(undoableStates, snap)
  /** 注册命令，并执行do */
  const registerCommand = async (command: Command) => {
    // ------ 步骤1：执行前准备：1.截断redo脏命令 2.生成【执行前全局快照】 3.初始化执行状态 ------
    let isExecSuccess = false // 标记do是否执行成功
    const preExecuteSnapshot = takeSnapshot() // ✅ 执行前全局状态快照：用于失败后回滚
    // 原有逻辑：撤销后新增操作，截断指针后的redo命令
    if (currentIndex.value < commandStack.value.length - 1) {
      commandStack.value = commandStack.value.slice(0, currentIndex.value + 1)
    }

    try {
      // ------ 步骤2：执行命令的do方法 ------
      await command.do()
      isExecSuccess = true // 执行成功，标记为true
    } catch (error) {
      // ------ 步骤3：捕获do执行失败的异常【核心兜底】 ------
      isExecSuccess = false
      console.error(`【命令执行失败】`, isError(error) ? error.message : error, command)
      // ✅ 关键：执行失败 → 一键回滚到【执行前的所有状态】，无任何残留
      restoreSnapshot(preExecuteSnapshot)
      // ✅ 可选：抛出错误给业务层，方便组件做用户提示（如Toast）
      throw new Error(`操作失败：${isError(error) ? error.message : error}`)
    } finally {
      // ------ 步骤4：最终判断：只有执行成功的命令，才推入命令栈！失败则拦截，不入库！ ------
      if (isExecSuccess) {
        commandStack.value.push(command)
        // 原有逻辑：限制最大历史记录数
        if (commandStack.value.length > maxHistory.value) commandStack.value.shift()
        currentIndex.value = commandStack.value.length - 1
        //? 执行完成一次需要undo的操作后，一定需要触发保存工程配置事件
        eventBus.emit('config:save', 2000)
      }
      // 执行失败：什么都不做，命令不会入栈，状态已回滚，无任何副作用
    }
  }
  const undo = async () => {
    if (!canUndo.value) return
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
    }
    currentIndex.value--
  }
  const redo = async () => {
    if (!canRedo.value) return
    currentIndex.value++
    const cmd = commandStack.value[currentIndex.value]
    // 可选：对redo也做异常捕获
    try {
      await cmd.do()
    } catch (error) {
      console.error(`【重做失败】`, error)
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

  const selected = ref<FabricObject | undefined>(undefined)
  function setSelected(val: FabricObject | undefined) {
    console.log('selected change1', val)
    selected.value = val
  }
  const selectType = computed(() => {
    if (!selected.value) {
      return 'bg'
    } else {
      console.log('selected change', selected.value.type)
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
    setPenSubType,
    undoableStates,
    canUndo,
    canRedo,
    takeSnapshot,
    restoreSnapshot,
    registerCommand,
    undo,
    redo
  }
})
