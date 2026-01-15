// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import type { Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { type FabricObject } from 'fabric'
import { getIdsFromObject, restoreSelection } from '@/stores/utils/util'

// type ModifyAttrs = Partial<FabricObjectProps>
export const useSelect = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)
  // // 辅助函数：从对象中提取 ID 列表
  const setSelect = async (before: FabricObject | undefined, after: FabricObject | undefined) => {
    // 1. 在命令创建时就提取 ID，而不是保存对象引用
    const beforeIds = getIdsFromObject(before)
    const afterIds = getIdsFromObject(after)

    editorStore.registerCommand(
      {
        do: async () => {
          const obj = restoreSelection(afterIds, editor.stage)
          if (obj) {
            editor.stage.setActiveObject(obj)
          } else {
            editor.stage.discardActiveObject()
          }
          editor.stage.requestRenderAll()
        },
        undo: async () => {
          const obj = restoreSelection(beforeIds, editor.stage)
          if (obj) {
            editor.stage.setActiveObject(obj)
          } else {
            editor.stage.discardActiveObject()
          }
          editor.stage.requestRenderAll()
        }
      },
      false
    )
  }
  return { setSelect }
}
