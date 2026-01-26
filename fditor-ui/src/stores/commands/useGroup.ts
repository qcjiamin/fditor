// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { getIdsFromObject, isCanvasReady, isElementValid } from '@/stores/utils/util'
import { Group, ActiveSelection } from 'fabric'
// 不支持多选的锁定

// type ModifyAttrs = Partial<FabricObjectProps>
export const useGroup = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  const executeGroup = async (targetObj: ActiveSelection) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas)) return
    const ids = getIdsFromObject(targetObj)
    let groupId: string | null = null
    editorStore.registerCommand({
      do: async () => {
        //? why not activeSelection.toGroup? activeSelection不进入history
        // 拆散activeSelection
        editor.stage.discardActiveObject()
        const objs = ids.map((id) => {
          const obj = editor.getObjectById(id)
          if (!obj) throw new Error('The object does not exist')
          return obj
        })
        objs.forEach((obj) => {
          editor.stage.remove(obj)
        })
        const obj = Group.fromObjs(objs)
        editor.add(obj)
        //? undo 再redo时要与第一次do id一致
        if (groupId) {
          obj.id = groupId
        } else {
          groupId = obj.id
        }
        editorStore.setSelected([obj.id])
        editor.render()
      },
      undo: async () => {
        if (!groupId) throw new Error('do not have groupId')
        const group = editor.getObjectById(groupId) as Group
        if (!group) {
          throw new Error('do not have group')
        }
        group.toActiveSelection()
        editorStore.setSelected([...ids])
        // if (targetObj.isLock()) {
        //   targetObj.unlock()
        // } else {
        //   targetObj.lock()
        // }
      }
    })
  }

  const executeUnGroup = async (targetObj: Group) => {
    const ids = targetObj.getObjects().map((obj) => obj.id)
    const groupId = targetObj.id
    editorStore.registerCommand({
      do: async () => {
        const group = editor.getObjectById(groupId) as Group
        if (!group) throw new Error('The object does not exist')
        group.toActiveSelection()
        editorStore.setSelected([...ids])
      },
      undo: async () => {
        editor.stage.discardActiveObject()
        const objs = ids.map((id) => {
          const obj = editor.getObjectById(id)
          if (!obj) throw new Error('The object does not exist')
          return obj
        })
        objs.forEach((obj) => {
          editor.stage.remove(obj)
        })
        const obj = Group.fromObjs(objs)
        editor.add(obj)
        //! 恢复group的id
        obj.id = groupId
        editorStore.setSelected([obj.id])
        editor.render()
      }
    })
  }

  return { executeGroup, executeUnGroup }
}
