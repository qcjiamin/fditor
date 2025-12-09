import { useHotkeys } from './useHotkeys'
import type { Editor } from '@fditor/core'
import { isActiveSelection, isGroup } from '@fditor/core'
import type { HotkeysEvent } from 'hotkeys-js'
import hotkeys from 'hotkeys-js'

export function useEditorHotkeys(editor: Editor) {
  // 方向键移动
  useHotkeys('left, right, up, down', (_e: KeyboardEvent, handler: HotkeysEvent) => {
    const selected = editor.getActiveObject()
    if (!selected) return
    switch (handler.key) {
      case 'left':
        selected.eset('left', selected.left - 1)
        break
      case 'right':
        selected.eset('left', selected.left + 1)
        break
      case 'up':
        selected.eset('top', selected.top - 1)
        break
      case 'down':
        selected.eset('top', selected.top + 1)
        break
      default:
        break
    }
  })

  // 组合/解组
  useHotkeys('ctrl+g', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const selected = editor.getActiveObject()
    if (!selected) return
    if (isActiveSelection(selected)) {
      selected.toGroup()
    } else if (isGroup(selected)) {
      selected.toActiveSelection()
    }
  })

  // 层级移动
  useHotkeys('ctrl+[, ctrl+], ctrl+alt+[, ctrl+alt+]', (_e: KeyboardEvent, handler: HotkeysEvent) => {
    const selected = editor.getActiveObject()
    if (!selected) return
    switch (handler.key) {
      case 'ctrl+[':
        selected.sendBackwards()
        break
      case 'ctrl+]':
        selected.bringForward()
        break
      case 'ctrl+alt+[':
        selected.sendToBack()
        break
      case 'ctrl+alt+]':
        selected.bringToFront()
        break
      default:
        break
    }
  })

  // 全局配置：排除可编辑元素（输入框、文本域、contenteditable 元素）
  hotkeys.filter = function (event) {
    const target = event.target as HTMLElement
    // 排除可编辑元素
    const isEditable =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      (target.tagName === 'DIV' && target.contentEditable === 'true')

    // 返回 false 则不触发自定义快捷键，保留原生行为
    return !isEditable
  }

  // 复制
  useHotkeys('ctrl+c', (e) => {
    e.preventDefault()
    // e.stopPropagation()
    const selected = editor.getActiveObject()
    if (!selected) return
    editor.copy(selected)
  })
  // 粘贴
  useHotkeys('ctrl+v', (e) => {
    e.preventDefault()
    // e.stopPropagation()
    editor.paste()
  })
}
