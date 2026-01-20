// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { isActiveSelection, type Editor, type HorizontalAlign, type VerticalAlign } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { getIdsFromObject, isCanvasReady, isElementValid, restoreSelection } from '@/stores/utils/util'
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
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return
    const ids = getIdsFromObject(targetObj)
    if (!ids.length) return
    let oldPositions: { left: number; top: number }[] = []
    editorStore.registerCommand({
      do: async () => {
        if (ids.length === 0) return
        const obj = restoreSelection(ids, editor.stage)!
        if (isActiveSelection(obj)) {
          const objects = obj.getObjects()
          oldPositions = objects.map((obj) => ({
            left: obj.left,
            top: obj.top
          }))
        }
        obj.setAlign(newAttr)
      },
      undo: async () => {
        if (ids.length === 0) return
        const obj = restoreSelection(ids, editor.stage)!
        if (isActiveSelection(obj)) {
          const objects = obj.getObjects()

          objects.forEach((obj, index) => {
            const pos = oldPositions[index]
            if (pos) {
              obj.left = pos.left
              obj.top = pos.top
              obj.setCoords()
            }
          })
          //? 为什么新建而不是复用 obj? bound需重新计算
          const selection = new ActiveSelection(objects, { canvas })
          canvas.setActiveObject(selection)
          canvas.requestRenderAll()
        } else {
          obj.eset(oldAttr, checkChange)
        }
      }
    })
  }
  return { setAlign }
}
