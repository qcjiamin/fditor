// stores/history.js 【组合式写法】
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  // ============ 状态 ============
  const historyStack = ref([]) // 历史状态快照栈
  const currentIndex = ref(-1) // 当前快照指针
  const maxHistory = ref(50) // 最大历史记录数，防止内存溢出

  // ============ 计算属性 ============
  const canUndo = computed(() => currentIndex.value > 0) // 是否可撤销
  const canRedo = computed(() => currentIndex.value < historyStack.value.length - 1) // 是否可重做
  const currentSnapshot = computed(() => historyStack.value[currentIndex.value] || null) // 当前快照

  // 初始化历史记录
  const initHistory = (initialState) => {
    const snapshot = JSON.parse(JSON.stringify(initialState))
    historyStack.value = [snapshot]
    currentIndex.value = 0
  }

  // 记录新状态（核心方法，每次操作后调用）
  const recordState = (newState) => {
    const snapshot = JSON.parse(JSON.stringify(newState))
    // 核心逻辑：新增操作后，截断指针后的redo记录（redo失效）
    if (currentIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, currentIndex.value + 1)
    }
    // 推入新快照
    historyStack.value.push(snapshot)
    // 超出最大条数，删除最旧记录，指针同步左移
    if (historyStack.value.length > maxHistory.value) {
      historyStack.value.shift()
      currentIndex.value--
    }
    // 更新指针到最新位置
    currentIndex.value = historyStack.value.length - 1
  }

  // 撤销：返回上一个快照
  const undo = () => {
    if (!canUndo.value) return null
    currentIndex.value--
    return historyStack.value[currentIndex.value]
  }

  // 重做：返回下一个快照
  const redo = () => {
    if (!canRedo.value) return null
    currentIndex.value++
    return historyStack.value[currentIndex.value]
  }

  // 清空历史记录，恢复初始状态
  const clearHistory = (initialState) => {
    const snapshot = JSON.parse(JSON.stringify(initialState))
    historyStack.value = [snapshot]
    currentIndex.value = 0
  }

  // 必须return导出，外部才能访问
  return {
    historyStack,
    currentIndex,
    maxHistory,
    canUndo,
    canRedo,
    currentSnapshot,
    initHistory,
    recordState,
    undo,
    redo,
    clearHistory
  }
})
