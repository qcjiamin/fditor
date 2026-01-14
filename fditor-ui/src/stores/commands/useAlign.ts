// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import type { Editor, HorizontalAlign, VerticalAlign } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { isCanvasReady, isElementValid } from '@/stores/utils/util'
import { ActiveSelection, type FabricObject } from 'fabric'

// type ModifyAttrs = Partial<FabricObjectProps>
export const useAlign = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  const setAlign = async <T extends FabricObject>(
    targetObj: T,
    newAttr: HorizontalAlign | VerticalAlign,
    oldAttr: { left: number; top: number },
    checkChange: boolean = true
  ) => {
    if (targetObj instanceof ActiveSelection) {
      if (!isCanvasReady(canvas) || !newAttr) return
    } else {
      if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return
    }

    if (targetObj instanceof ActiveSelection) {
      const selection = targetObj as ActiveSelection
      const objects = selection.getObjects()
      const oldPositions = objects.map((obj) => ({
        left: obj.left,
        top: obj.top
      }))

      editorStore.registerCommand({
        do: async () => {
          // const selection = new ActiveSelection(objects, { canvas })
          // canvas.setActiveObject(selection)
          selection.setAlign(newAttr)
        },
        undo: async () => {
          objects.forEach((obj, index) => {
            const pos = oldPositions[index]
            if (pos) {
              obj.left = pos.left
              obj.top = pos.top
              obj.setCoords()
            }
          })
          const selection = new ActiveSelection(objects, { canvas })
          canvas.setActiveObject(selection)
          canvas.requestRenderAll()
        }
      })
      return
    }

    //! 属性都被序列化了，执行功能时再活化, 不能将对象保存在命令中
    editorStore.registerCommand({
      do: async () => {
        targetObj.setAlign(newAttr)
      },
      undo: async () => {
        targetObj.eset(oldAttr, checkChange)
      }
    })
  }
  return { setAlign }
}
