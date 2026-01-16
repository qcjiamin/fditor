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
        editor.add(fabricObj)
        editor.render()
        //? 添加的副作用-选中状态在selected:change中被锁拦截，需要主动做store切换
        editorStore.setSelected([fabricObj.id])
      },
      undo: async () => {
        canvas.remove(fabricObj)
        editorStore.setSelected([])
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
