// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import type { Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { cloneValue, isCanvasReady, isElementValid } from '@/stores/utils/util'
import type { FabricObject } from 'fabric'

//标量	left / top / angle / opacity	modifyElementAttr
//结构数据	path / points / dashArray	深拷贝
//对象实例	clipPath / filters / shadow	专用 command

type ModifyAttrs = Partial<FabricObject>
export const useAttrModify = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  const modifyElementAttr = (targetObj: FabricObject, newAttr: ModifyAttrs, oldAttr?: ModifyAttrs) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return
    console.log('modifyElementAttr', newAttr, oldAttr)
    let _oldAttr: ModifyAttrs = {}
    if (oldAttr) {
      _oldAttr = oldAttr
    } else {
      const keys = Object.keys(newAttr) as Array<keyof FabricObject>
      keys.forEach((key) => {
        const value = targetObj.get(key)
        _oldAttr[key] = value === null ? undefined : cloneValue(value)
      })
    }

    editorStore.registerCommand({
      do: async () => {
        console.log('!!!!!!!!', newAttr)
        targetObj.set(cloneValue(newAttr))
        canvas.renderAll()
      },
      undo: async () => {
        targetObj.set(cloneValue(_oldAttr))
        canvas.renderAll()
      }
    })
  }
  return { modifyElementAttr }
}
