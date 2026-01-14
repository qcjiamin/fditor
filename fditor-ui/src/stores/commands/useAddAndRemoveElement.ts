// src/fabric/commands/elementCmd.js 【元素相关命令：添加/删除】
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { isCanvasReady, isElementValid } from '@/stores/utils/util'
import type { Editor } from '@fditor/core'
import type { FabricObject } from 'fabric'
import { inject } from 'vue'

export const useAddAndDeleteElement = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  // ✅ 添加元素命令
  const addElement = (fabricObj: FabricObject) => {
    const canvas = editor.stage

    // if (!isCanvasReady(canvas) || !fabricObj) return
    // const preSnap = editorStore.takeSnapshot()

    editorStore.registerCommand({
      do: async () => {
        // editor.add(fabricObj)
        canvas.add(fabricObj)
        canvas._setActiveObject(fabricObj)
        editorStore.setSelected(fabricObj)
        editor.render()

        // canvas.add(fabricObj)
        // canvas.setActiveObject(fabricObj)
        // editorStore.undoableStates.selectedId = fabricObj.id
        // editorStore.undoableStates.cvsState = 'edit'
      },
      undo: async () => {
        canvas._remove(fabricObj)
        canvas._discardActiveObject()
        editorStore.setSelected(undefined)
        editor.render()

        // canvas.remove(fabricObj)
      }
    })
  }

  // ✅ 删除元素命令
  const deleteElement = (targetObj: FabricObject) => {
    const canvas = editor.stage

    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas)) return
    // const preSnap = editorStore.takeSnapshot()

    editorStore.registerCommand({
      do: async () => {
        canvas.remove(targetObj)
      },
      undo: async () => {
        canvas.add(targetObj)
      }
    })
  }
  return { addElement, deleteElement }
}
