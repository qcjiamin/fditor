// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'

// type ModifyAttrs = Partial<FabricObjectProps>
export const usePenPath = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)
  const penChange = async () => {
    const canvas = editor.stage
    editorStore.registerCommand(
      {
        type: 'pen',
        do: async () => {
          if (!canvas.pen) throw new Error('pen is not exist')
          canvas.pen.redo()
        },
        undo: async () => {
          if (!canvas.pen) throw new Error('pen is not exist')
          if (canvas.pen.historyIndex <= 0) {
            // 退出钢笔绘制
            // 清空钢笔历史记录
            editorStore.setCanvasMode('move')
            editorStore.clearPenPathHistory()
            return
          }

          canvas.pen.undo()
        }
      },
      false
    )
  }
  return { penChange }
}
