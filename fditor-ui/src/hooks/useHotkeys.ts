import hotkeys, { type KeyHandler } from 'hotkeys-js'
import { onMounted, onUnmounted } from 'vue'

/**
 * 快捷键 hook
 * 自动处理绑定和解绑
 * @param keys 快捷键组合，如 'ctrl+c, command+c'
 * @param callback 回调函数
 */
export function useHotkeys(keys: string, callback: KeyHandler) {
  onMounted(() => {
    hotkeys(keys, callback)
  })

  onUnmounted(() => {
    hotkeys.unbind(keys, callback)
  })
}
