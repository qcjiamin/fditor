import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { isCanvasReady, isElementValid } from '@/stores/utils/util'
import { createGradientFromObject } from '@/utils/common'
import { isGradient } from '@/utils/typeHelper'
import type { DefGradientOptions } from '@/utils/types'
import { type colorVal, type Editor } from '@fditor/core'
import { Gradient, type FabricObject, type GradientType } from 'fabric'
import { inject } from 'vue'

export const useModifyColor = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage

  /**
   * 通用的颜色修改方法，支持修改 fill 和 stroke
   * @param targetObj 目标对象
   * @param propertyType 属性类型：'fill' 或 'stroke'
   * @param newVal 新的颜色值
   * @param oldVal 旧的颜色值（可选，如果不提供则从对象上获取）
   */
  function modifyColor(
    targetObj: FabricObject,
    propertyType: 'fill' | 'stroke',
    newVal: colorVal,
    oldVal?: colorVal
  ) {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newVal) return

    /** undo的颜色值是否为序列化后的渐变对象 */
    let oldValIsGradient = false
    /** undo的颜色值为渐变对象时，其渐变类型 */
    let oldGradientType: GradientType = 'linear'
    let _oldVal: Gradient<'linear'> | Gradient<'radial'> | string | null = null

    // 获取旧值
    if (oldVal) {
      if (isGradient(oldVal)) {
        _oldVal = oldVal.toObject() as Gradient<'linear'>
        oldValIsGradient = true
        oldGradientType = oldVal.type
      } else {
        _oldVal = oldVal
      }
    } else {
      const currentVal = targetObj[propertyType]
      if (currentVal) {
        if (isGradient(currentVal)) {
          _oldVal = currentVal.toObject() as Gradient<'linear'>
          oldValIsGradient = true
          oldGradientType = currentVal.type
        } else {
          _oldVal = currentVal as string
        }
      } else {
        _oldVal = null
      }
    }

    editorStore.registerCommand({
      do: async () => {
        targetObj.eset({ [propertyType]: newVal })
        canvas.renderAll()
      },
      undo: async () => {
        let undoVal: Gradient<'linear'> | Gradient<'radial'> | string | null = null
        if (oldValIsGradient) {
          if (oldGradientType === 'linear') {
            undoVal = await createGradientFromObject(_oldVal as DefGradientOptions<'linear'>)
          } else if (oldGradientType === 'radial') {
            undoVal = await createGradientFromObject(_oldVal as DefGradientOptions<'radial'>)
          }
        } else {
          undoVal = _oldVal
        }
        targetObj.eset({ [propertyType]: undoVal })
        canvas.renderAll()
      }
    })
  }

  /**
   * 修改填充颜色（向后兼容的便捷方法）
   */
  function modifyFill(targetObj: FabricObject, newVal: colorVal, oldVal?: colorVal) {
    modifyColor(targetObj, 'fill', newVal, oldVal)
  }

  /**
   * 修改描边颜色（新增的便捷方法）
   */
  function modifyStroke(targetObj: FabricObject, newVal: colorVal, oldVal?: colorVal) {
    modifyColor(targetObj, 'stroke', newVal, oldVal)
  }

  return { modifyColor, modifyFill, modifyStroke }
}
