// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import type { Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { cloneValue, isCanvasReady, isElementValid } from '@/stores/utils/util'
import type { FabricObject, FabricObjectProps } from 'fabric'

//标量	left / top / angle / opacity	modifyElementAttr
//结构数据	path / points / dashArray	深拷贝
//对象实例	clipPath / filters / shadow	专用 command

type ModifyAttrs = Partial<FabricObjectProps>
export const useAttrModify = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  const modifyElementAttr = (
    targetObj: FabricObject,
    newAttr: ModifyAttrs,
    oldAttr: ModifyAttrs | null = null,
    checkChange: boolean = true
  ) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return
    console.log('modifyElementAttr', newAttr, oldAttr)
    let _oldAttr: ModifyAttrs = {}
    if (oldAttr) {
      _oldAttr = oldAttr
    } else {
      //todo ts应用
      const keys = Object.keys(newAttr) as (keyof FabricObjectProps)[]
      keys.forEach((key) => {
        const value = targetObj.get(key)
        _oldAttr[key] = cloneValue(value)
      })
    }

    editorStore.registerCommand({
      do: async () => {
        targetObj.eset(cloneValue(newAttr), checkChange)
        canvas.renderAll()
      },
      undo: async () => {
        targetObj.eset(cloneValue(_oldAttr), checkChange)
        canvas.renderAll()
      }
    })
  }
  return { modifyElementAttr }
}
