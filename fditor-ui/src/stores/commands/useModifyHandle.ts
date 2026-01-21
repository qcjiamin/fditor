/* eslint-disable @typescript-eslint/no-explicit-any */
// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { isActiveSelection, type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import {
  activateObject,
  isCanvasReady,
  isElementValid,
  restoreSelection,
  serializeFabricValue
} from '@/stores/utils/util'
import { type FabricObject } from 'fabric'
// import { cloneDeep } from 'lodash'

// 计算旧状态， 获取新状态
// type ModifyAttrs = Partial<FabricObjectProps>
export const useModifyHandle = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)
  const canvas = editor.stage

  const modifyCommand = async <T extends FabricObject>(
    targetObj: T,

    newAttr: Partial<T> & Record<string, any>,
    oldAttr: Partial<T> | Array<Partial<T>>, // 支持传入数组
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkChange: boolean = true
  ) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return

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
    let sourceOldAttrs: Array<Partial<T> | null> = []
    if (Array.isArray(oldAttr)) {
      sourceOldAttrs = oldAttr
    } else if (oldAttr) {
      sourceOldAttrs = [oldAttr]
    } else {
      sourceOldAttrs = new Array(objects.length).fill(null)
    }

    // 1. 准备阶段：生成所有对象的变更快照
    // 重要：对于 Handle 操作，此时对象已经在画布上被修改完成了（User Action Finished）
    // 所以直接从 object 读取的值就是 "New Value"
    // "Old Value" 必须依赖传入的 oldAttr (如果是多选，必须是数组才能准确)
    // 如果 oldAttr 不准确（比如只传了 Group 的旧状态），那么 Undo 可能会有偏差，但这需要 View 层配合修正传入值
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i]

      // A. Capture New State (Current State)
      // 只有被修改的那些几何属性才重要，但为了通用，我们通常读取 newAttr 的 keys
      // 或者，对于 Handle 变换，我们主要关注几何属性：top, left, scaleX, scaleY, angle, skewX, skewY, flipX, flipY
      const transformKeys = [
        'top',
        'left',
        'scaleX',
        'scaleY',
        'angle',
        'skewX',
        'skewY',
        'flipX',
        'flipY',
        'width',
        'height'
      ]

      const _newAttrSnapshot: Record<string, any> = {}
      const _oldAttrSnapshot: Record<string, any> = {}

      // 我们遍历 transformKeys 来抓取状态
      for (const key of transformKeys) {
        _newAttrSnapshot[key] = await serializeFabricValue(obj.get(key as keyof FabricObject))
      }

      // B. Capture Old State
      const sourceOld = sourceOldAttrs[i]
      if (sourceOld) {
        // 如果传入了旧值，优先用旧值（View 层需保证传入的准确性）
        const keys = Object.keys(sourceOld) as string[]
        for (const key of keys) {
          // 只有当 key 在 transformKeys 里，或者为了保险全部存下来
          _oldAttrSnapshot[key] = await serializeFabricValue(sourceOld[key as keyof FabricObject])
        }
        // 补充缺失的 keys (如果是部分更新) -> 实际上 Handle 都是全量更新几何属性最好
      } else {
        // Fallback: 如果没传旧值，那 Undo 就没法回去了。这里只能假设它是原地不动？
        // 或者暂存当前的（这将导致 Undo 无效，但不会报错）
        Object.assign(_oldAttrSnapshot, _newAttrSnapshot)
      }

      changes.push({
        target: obj,
        oldAttr: _oldAttrSnapshot,
        newAttr: _newAttrSnapshot
      })
    }

    // 取消选中 (为了避免 Group 引用干扰，我们在执行前是否要取消？)
    // 实际上 Handle 操作完后，用户可能还想保持选中。
    // 我们不需要 discardActiveObject，除非是为了重建 Group。
    const ids = objects.map((o) => o.id)

    // 2. 执行阶段：注册聚合命令
    editorStore.registerCommand(
      {
        do: async () => {
          // 应用新状态
          for (const change of changes) {
            const { target, newAttr } = change
            const _activeNew: Record<string, any> = {}
            for (const key in newAttr) {
              _activeNew[key] = await activateObject(newAttr[key])
            }
            target.set(_activeNew)
          }

          // 恢复选中 (确保 UI 状态一致)
          const sel = restoreSelection(ids, canvas)
          if (sel) canvas.setActiveObject(sel)

          canvas.requestRenderAll()
          // 同步 Store
          editorStore.setSelected(ids)
        },
        undo: async () => {
          // 应用旧状态
          for (const change of changes) {
            const { target, oldAttr } = change
            const _activeOld: Record<string, any> = {}
            for (const key in oldAttr) {
              _activeOld[key] = await activateObject(oldAttr[key])
            }
            target.set(_activeOld)
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
