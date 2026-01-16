// src/fabric/commands/attrCmd.js 【属性相关命令：改色/移动/缩放/旋转等】
import { inject } from 'vue'
import { isActiveSelection, type Editor } from '@fditor/core'
import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { activateObject, isCanvasReady, isElementValid, serializeFabricValue } from '@/stores/utils/util'
import type { FabricObject } from 'fabric'
import { cloneDeep } from 'lodash'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newAttr: Partial<T> & Record<string, any>,
    oldAttr: Partial<T> | null = null,
    checkChange: boolean = true
  ) => {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newAttr) return
    // 多选的属性设置需要处理的情况：
    // 1. 需要设置到子元素还是组元素？目前的场景都是子元素
    // 2. 普通的set也需要处理
    // 3. 是否需要属性序列化？ - 渐变颜色支持组上设置？
    // 4. 部分属性才能在组上设置 - 目前取全对象交集
    if (isActiveSelection(targetObj)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _newAttrSnapshot: Record<string, any> = {}
      for (const key in newAttr) {
        // 记录新值快照 (防止传入的 newAttr 实例在外部被修改)
        _newAttrSnapshot[key] = await serializeFabricValue(newAttr[key])
      }

      const objs = targetObj.getObjects()
      // 收集多选对象上每一个子元素的原始属性，redo时恢复
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _oldAttrSnapshot: Record<string, any>[] = []
      if (oldAttr) {
        objs.forEach(() => {
          _oldAttrSnapshot.push(cloneDeep(oldAttr))
        })
      } else {
        objs.forEach((obj) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const temp: Record<string, any> = {}
          for (const key in newAttr) {
            temp[key] = obj[key as keyof FabricObject]
          }
          _oldAttrSnapshot.push(temp)
        })
      }
      editorStore.registerCommand({
        do: async () => {
          for (let i = 0; i < objs.length; i++) {
            objs[i].set(_newAttrSnapshot, checkChange)
          }
          if (objs[0].group) {
            canvas.fire('def:modified', { target: objs[0].group })
          }
        },
        undo: async () => {
          for (let i = 0; i < objs.length; i++) {
            objs[i].set(_oldAttrSnapshot[i], checkChange)
          }
          if (objs[0].group) {
            canvas.fire('def:modified', { target: objs[0].group })
          }
        }
      })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _newAttrSnapshot: Record<string, any> = {}
    for (const key in newAttr) {
      // 记录新值快照 (防止传入的 newAttr 实例在外部被修改)
      _newAttrSnapshot[key] = await serializeFabricValue(newAttr[key])
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _oldAttr: Record<string, any> = {}
    if (oldAttr) {
      // _oldAttr = oldAttr
      // 传入的旧属性也如果是对象，那么也按照对象传入
      const keys = Object.keys(oldAttr) as string[]
      for (let i = 0; i < keys.length; i++) {
        const value = oldAttr[keys[i] as keyof FabricObject]
        _oldAttr[keys[i]] = await serializeFabricValue(value)
      }
    } else {
      const keys = Object.keys(newAttr) as string[]
      for (let i = 0; i < keys.length; i++) {
        const value = targetObj.get(keys[i] as string)
        _oldAttr[keys[i]] = await serializeFabricValue(value)
      }
    }

    //! 属性都被序列化了，执行功能时再活化, 不能将对象保存在命令中
    editorStore.registerCommand({
      do: async () => {
        for (const key in _newAttrSnapshot) {
          _newAttrSnapshot[key] = await activateObject(_newAttrSnapshot[key])
        }
        targetObj.eset(_newAttrSnapshot, checkChange)
        canvas.renderAll()
      },
      undo: async () => {
        for (const key in _oldAttr) {
          _oldAttr[key] = await activateObject(_oldAttr[key])
        }
        targetObj.eset(_oldAttr, checkChange)
        canvas.renderAll()
      }
    })
  }
  return { modifyAttr }
}
