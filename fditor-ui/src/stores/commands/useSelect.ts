// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import type { Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { restoreSelection } from '@/stores/utils/util'

// type ModifyAttrs = Partial<FabricObjectProps>
export const useSelect = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)
  // // 辅助函数：从对象中提取 ID 列表
  const setSelect = async (beforeIds: string[], afterIds: string[]) => {
    // 1. 在命令创建时就提取 ID，而不是保存对象引用
    // const beforeIds = getIdsFromObject(before)
    // const afterIds = getIdsFromObject(after)

    editorStore.registerCommand(
      {
        do: async () => {
          const obj = restoreSelection(afterIds, editor.stage)
          // editorStore.setSelected(obj || undefined)
          if (obj) {
            editor.stage.setActiveObject(obj)
          } else {
            editor.stage.discardActiveObject()
          }
          //! 放在功能方法执行之后，有些情况下[例如多选、拆组]，执行后id才能被查询到
          //todo 拆组、重新建组的id问题需要处理
          editorStore.setSelected(afterIds)
          editor.stage.requestRenderAll()
        },
        undo: async () => {
          const obj = restoreSelection(beforeIds, editor.stage)
          // editorStore.setSelected(obj || undefined)
          if (obj) {
            editor.stage.setActiveObject(obj)
          } else {
            editor.stage.discardActiveObject()
          }
          editorStore.setSelected(beforeIds)
          editor.stage.requestRenderAll()
        }
      },
      false
    )
  }
  return { setSelect }
}
