// src/fabric/commands/elementCmd.js 【元素相关命令：添加/删除】
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import type { DeleteObjInfo } from '@/stores/type'
import { isCanvasReady, isElementValid, restoreSelection } from '@/stores/utils/util'
import { isActiveSelection, type Editor } from '@fditor/core'
import { ActiveSelection, classRegistry, type FabricObject } from 'fabric'
import { inject } from 'vue'

export const useAddAndDeleteElement = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  // ✅ 添加元素命令
  const addElement = (fabricObj: FabricObject) => {
    const canvas = editor.stage

    // if (!isCanvasReady(canvas) || !fabricObj) return
    // const preSnap = editorStore.takeSnapshot()
    const addObjsInfo: DeleteObjInfo[] = []
    const item = {
      id: fabricObj.id,
      serialize: fabricObj.toJSON(),
      //? 添加用不上这个，直接加到最顶层
      zIndex: 0
    }
    addObjsInfo.push(item)

    // 目前添加仅支持单元素添加，多元素添加暂时没有需求
    editorStore.registerCommand({
      do: async () => {
        for (let i = 0; i < addObjsInfo.length; i++) {
          const item = addObjsInfo[i]
          const klass = classRegistry.getClass(item.serialize.type) as typeof FabricObject
          const instance = (await klass.fromObject(item.serialize)) as unknown as FabricObject
          if (instance) {
            canvas.add(instance)
          } else {
            throw new Error('undo delete 时实例化对象失败')
          }
        }

        const ids = addObjsInfo.map((item) => item.id)
        const obj = restoreSelection(ids, canvas)
        if (obj) canvas.setActiveObject(obj)

        editor.render()
        //? 添加的副作用-选中状态在selected:change中被锁拦截，需要主动做store切换
        editorStore.setSelected(ids)
      },
      undo: async () => {
        const deleteObjs = addObjsInfo
          .map((item) => {
            return canvas.getObjectById(item.id)
          })
          .filter((obj): obj is FabricObject => obj != null)

        canvas.remove(...deleteObjs)
        canvas.discardActiveObject()
        canvas.requestRenderAll()

        editorStore.setSelected([])
      }
    })
  }

  // ✅ 删除元素命令
  const deleteElement = (targetObj: FabricObject) => {
    const canvas = editor.stage
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas)) return
    // const preSnap = editorStore.takeSnapshot()
    const deleteObjsInfo: DeleteObjInfo[] = []
    if (isActiveSelection(targetObj)) {
      const objs = [...targetObj._objects]
      //?
      canvas.discardActiveObject()
      objs.forEach((obj) => {
        const item = {
          id: obj.id,
          serialize: obj.toJSON(),
          zIndex: obj.getZIndex()
        }
        deleteObjsInfo.push(item)
      })
      //? 先解除多选，序列化画布坐标系下的子元素，再恢复多选，让redo和do执行条件一致
      const selection = new ActiveSelection(objs, { canvas })
      canvas.setActiveObject(selection)
    } else {
      const item = {
        id: targetObj.id,
        serialize: targetObj.toJSON(),
        zIndex: targetObj.getZIndex()
      }
      deleteObjsInfo.push(item)
    }

    editorStore.registerCommand({
      do: async () => {
        // 通过id查找对象
        const deleteObjs = deleteObjsInfo
          .map((item) => {
            return canvas.getObjectById(item.id)
          })
          .filter((obj): obj is FabricObject => obj != null)

        canvas.remove(...deleteObjs)
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        editorStore.setSelected([])
      },
      undo: async () => {
        // 添加所有元素，插入它们相应的位置，如果是多个元素，最后将其设置为多选状态，如果是单个元素，选中它
        for (let i = 0; i < deleteObjsInfo.length; i++) {
          const item = deleteObjsInfo[i]
          const klass = classRegistry.getClass(item.serialize.type) as typeof FabricObject
          const instance = (await klass.fromObject(item.serialize)) as unknown as FabricObject
          if (instance) {
            canvas.insertAt(item.zIndex, instance)
          } else {
            throw new Error('undo delete 时实例化对象失败')
          }
        }
        const deleteObjIds = deleteObjsInfo.map((item) => item.id)
        const obj = restoreSelection(deleteObjIds, canvas)
        if (obj) editor.stage.setActiveObject(obj)
        //todo UI逻辑，如何剥离？
        editorStore.setSelected([...deleteObjIds])
      }
    })
  }
  return { addElement, deleteElement }
}
