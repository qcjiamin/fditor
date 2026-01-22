/* eslint-disable @typescript-eslint/no-explicit-any */
// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { isActiveSelection, isTextObject, type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { isCanvasReady, isElementValid, restoreSelection } from '@/stores/utils/util'
import { type FabricObject } from 'fabric'
// import { cloneDeep } from 'lodash'

// 计算旧状态， 获取新状态
// type ModifyAttrs = Partial<FabricObjectProps>
export const useModifyHandle = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)

  const modifyCommand = async <T extends FabricObject>(
    targetObj: T,
    // newAttr: Partial<T> & Record<string, any>,
    oldAttr: Partial<T> | Array<Partial<T>>, // 支持传入数组

    isEditText: boolean = false
    // checkChange: boolean = true
  ) => {
    const canvas = editor.stage
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas)) return

    // 定义单个对象的变更结构
    type TransformState = {
      target: FabricObject
      oldAttr: Record<string, any>
      newAttr: Record<string, any>
    }

    const changes: TransformState[] = []

    // 获取需要修改的对象列表
    const objects = isActiveSelection(targetObj) ? [...targetObj._objects] : [targetObj]

    // 归一化 oldAttr
    let sourceOldAttrs: Array<Partial<T>> = []
    if (Array.isArray(oldAttr)) {
      sourceOldAttrs = oldAttr
    } else if (oldAttr) {
      sourceOldAttrs = [oldAttr]
    } else {
      sourceOldAttrs = new Array(objects.length).fill(null)
    }

    // 拿取新状态
    objects.forEach((obj, i) => {
      let itemOrigin: Record<string, any> = []
      if (isEditText) {
        if (isTextObject(obj)) {
          itemOrigin = {
            text: obj.text
          }
        }
      } else {
        itemOrigin = obj.getLayoutProps()
      }
      changes.push({
        target: obj,
        oldAttr: sourceOldAttrs[i],
        newAttr: itemOrigin
      })
    })

    // 取消选中 (为了避免 Group 引用干扰，我们在执行前是否要取消？)
    // 实际上 Handle 操作完后，用户可能还想保持选中。
    // 我们不需要 discardActiveObject，除非是为了重建 Group。
    const ids = objects.map((o) => o.id)

    // 2. 执行阶段：注册聚合命令
    editorStore.registerCommand(
      {
        do: async () => {
          // 先取消多选[让子元素恢复为画布坐标系]
          // 应用新的几何属性
          // 重新选中
          canvas.discardActiveObject()

          for (const change of changes) {
            const { target, newAttr } = change
            target.set(newAttr)
          }

          // 恢复选中 (确保 UI 状态一致)
          const sel = restoreSelection(ids, canvas)
          if (sel) canvas.setActiveObject(sel)

          canvas.requestRenderAll()
          // 同步 Store
          editorStore.setSelected(ids)
        },
        undo: async () => {
          //取消多选
          // 应用旧属性
          // 重新多选
          canvas.discardActiveObject()
          for (const change of changes) {
            const { target, oldAttr } = change
            target.set(oldAttr)
          }

          // 恢复选中
          const sel = restoreSelection(ids, canvas)
          if (sel) canvas.setActiveObject(sel)

          canvas.requestRenderAll()
          // 同步 Store
          editorStore.setSelected(ids)
        }
      },
      false
    )
  }
  return { modifyCommand }
}
