/* eslint-disable @typescript-eslint/no-explicit-any */
// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { isActiveSelection, type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { activateObject, isCanvasReady, isElementValid, serializeFabricValue } from '@/stores/utils/util'
import type { FabricObject } from 'fabric'
// import { cloneDeep } from 'lodash'

//标量	left / top / angle / opacity	modifyElementAttr
//结构数据	path / points / dashArray	深拷贝
//对象实例	clipPath / filters / shadow	专用 command

// type ModifyAttrs = Partial<FabricObjectProps>
export const useAttrModify = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  const modifyAttr = async <T extends FabricObject>(
    targetObj: T,

    newAttr: Partial<T> & Record<string, any>,
    oldAttr: Partial<T> | null = null,
    checkChange: boolean = true
  ) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return

    // 定义单个对象的变更结构
    type AttrChange = {
      target: FabricObject
      oldAttr: Record<string, any>
      newAttr: Record<string, any>
    }

    const changes: AttrChange[] = []

    // 获取需要修改的对象列表
    const objects = isActiveSelection(targetObj) ? targetObj.getObjects() : [targetObj]
    // 1. 准备阶段：生成所有对象的变更快照
    for (const obj of objects) {
      if (!isElementValid(obj, canvas)) continue

      // A. 准备新值快照
      const _newAttrSnapshot: Record<string, any> = {}
      for (const key in newAttr) {
        _newAttrSnapshot[key] = await serializeFabricValue(newAttr[key])
      }

      // B. 准备旧值快照
      const _oldAttrSnapshot: Record<string, any> = {}
      if (oldAttr && !isActiveSelection(targetObj)) {
        // 如果显式传入了 oldAttr 且是单选模式，使用传入值（多选模式下 oldAttr 通常不准确，需各自读取）
        const keys = Object.keys(oldAttr) as string[]
        for (const key of keys) {
          _oldAttrSnapshot[key] = await serializeFabricValue(oldAttr[key as keyof FabricObject])
        }
      } else {
        //todo 传入旧值， 理论上是数组，归一化，单个元素时也传入数组
        // 自动读取当前值作为旧值
        const keys = Object.keys(newAttr) as string[]
        for (const key of keys) {
          const value = obj.get(key as string)
          _oldAttrSnapshot[key] = await serializeFabricValue(value)
        }
      }

      changes.push({
        target: obj,
        oldAttr: _oldAttrSnapshot,
        newAttr: _newAttrSnapshot
      })
    }

    if (changes.length === 0) return

    // 2. 执行阶段：注册聚合命令
    editorStore.registerCommand({
      do: async () => {
        for (const change of changes) {
          const { target, newAttr } = change
          const _activeNew: Record<string, any> = {}
          for (const key in newAttr) {
            _activeNew[key] = await activateObject(newAttr[key])
          }
          target.set(_activeNew, checkChange)
          // target.eset(_activeNew, checkChange)
        }
        const _target = changes[0].target
        canvas.fire('def:modified', { target: _target.group ? _target.group : _target })
        canvas.requestRenderAll()
      },
      undo: async () => {
        for (const change of changes) {
          const { target, oldAttr } = change
          const _activeOld: Record<string, any> = {}
          for (const key in oldAttr) {
            _activeOld[key] = await activateObject(oldAttr[key])
          }
          // target.eset(_activeOld, checkChange)
          target.set(_activeOld, checkChange)
        }
        const _target = changes[0].target
        canvas.fire('def:modified', { target: _target.group ? _target.group : _target })
        canvas.requestRenderAll()
      }
    })
  }
  return { modifyAttr }
}
