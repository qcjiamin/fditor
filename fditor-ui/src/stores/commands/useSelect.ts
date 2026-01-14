// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import type { Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { type FabricObject } from 'fabric'

// type ModifyAttrs = Partial<FabricObjectProps>
export const useSelect = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)
  // const canvas = editor.stage
  //! 功能执行不能触发选择事件，不然会死循环，再次添加到历史记录中
  const setSelect = async (before: FabricObject | undefined, after: FabricObject | undefined) => {
    editorStore.registerCommand(
      {
        do: async () => {
          await editor.withSilence(() => {
            if (after === undefined) {
              editor.stage.discardActiveObject()
            } else {
              editor.stage.setActiveObject(after)
            }
            editor.render()
          })
        },
        undo: async () => {
          await editor.withSilence(() => {
            if (before === undefined) {
              editor.stage.discardActiveObject()
            } else {
              editor.stage.setActiveObject(before)
            }
            editor.render()
          })
        }
      },
      false
    )
  }
  return { setSelect }
}
