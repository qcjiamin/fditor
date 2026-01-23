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
export const useAttrModify = (instance?: Editor) => {
  const editorStore = useEditorStore()
  const editor = instance || (inject(EditorKey) as Editor)
  const canvas = editor.stage
  const modifyAttr = async <T extends FabricObject>(
    targetObj: T,

    newAttr: Partial<T> & Record<string, any>,
    oldAttr: Partial<T> | Array<Partial<T> | null> | null = null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // 统一归一化 oldAttr 为数组
    let sourceOldAttrs: (Partial<T> | null)[] = []
    if (Array.isArray(oldAttr)) {
      sourceOldAttrs = oldAttr
    } else if (oldAttr) {
      sourceOldAttrs = [oldAttr]
    } else {
      sourceOldAttrs = new Array(objects.length).fill(null)
    }

    // 1. 准备阶段：生成所有对象的变更快照
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i]
      if (!isElementValid(obj, canvas)) continue

      // A. 准备新值快照
      const _newAttrSnapshot: Record<string, any> = {}
      for (const key in newAttr) {
        _newAttrSnapshot[key] = await serializeFabricValue(newAttr[key])
      }

      // B. 准备旧值快照
      const _oldAttrSnapshot: Record<string, any> = {}

      const sourceOldAttr = sourceOldAttrs[i]

      if (sourceOldAttr) {
        const keys = Object.keys(sourceOldAttr) as string[]
        for (const key of keys) {
          _oldAttrSnapshot[key] = await serializeFabricValue(sourceOldAttr[key as keyof FabricObject])
        }
      } else {
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

    //todo 检查变更前后是否真的改变，来决定是否加入新的命令
    // 2. 执行阶段：注册聚合命令
    editorStore.registerCommand({
      do: async () => {
        for (const change of changes) {
          const { target, newAttr } = change
          const _activeNew: Record<string, any> = {}
          for (const key in newAttr) {
            _activeNew[key] = await activateObject(newAttr[key])
          }
          target.set(_activeNew)
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
          target.set(_activeOld)
        }
        const _target = changes[0].target
        canvas.fire('def:modified', { target: _target.group ? _target.group : _target })
        canvas.requestRenderAll()
      }
    })
  }
  return { modifyAttr }
}
