// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { isCanvasReady, isElementValid } from '@/stores/utils/util'
import { type FabricObject } from 'fabric'
// 不支持多选的锁定

// type ModifyAttrs = Partial<FabricObjectProps>
export const useLock = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  const toggleLock = async <T extends FabricObject>(targetObj: T) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas)) return
    editorStore.registerCommand({
      do: async () => {
        if (targetObj.isLock()) {
          targetObj.unlock()
        } else {
          targetObj.lock()
        }
      },
      undo: async () => {
        if (targetObj.isLock()) {
          targetObj.unlock()
        } else {
          targetObj.lock()
        }
      }
    })
  }
  return { toggleLock }
}
