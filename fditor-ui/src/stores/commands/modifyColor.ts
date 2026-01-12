import { EditorKey } from '@/constants/injectKey'
import { useEditorStore } from '@/stores/editorStore'
import { isCanvasReady, isElementValid } from '@/stores/utils/util'
import { isGradient } from '@/utils/typeHelper'
import { type colorVal, type Editor } from '@fditor/core'
import { Gradient, type FabricObject, type GradientOptions, type GradientType } from 'fabric'
import { inject } from 'vue'

export const useModifyColor = () => {
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const canvas = editor.stage
  function modifyFill(targetObj: FabricObject, newVal: colorVal, oldVal?: colorVal) {
    if (!isCanvasReady(canvas) || !isElementValid(targetObj, canvas) || !newVal) return
    let oldValIsGradient = false
    let oldGradientType: GradientType = 'linear'
    let _oldVal = null
    if (oldVal) {
      if (isGradient(oldVal)) {
        _oldVal = oldVal.toObject()
        oldValIsGradient = true
        oldGradientType = oldVal.type
      } else {
        _oldVal = oldVal
      }
    } else {
      if (isGradient(targetObj.fill)) {
        _oldVal = targetObj.fill.toObject()
      } else {
        _oldVal = oldVal
      }
    }

    editorStore.registerCommand({
      do: async () => {
        targetObj.set({ fill: newVal })
        canvas.renderAll()
      },
      undo: async () => {
        if (oldValIsGradient) {
          if (oldGradientType === 'linear') {
            targetObj.set({ fill: Gradient.fromObject(_oldVal as GradientOptions<'linear'>) })
          } else if (oldGradientType === 'radial') {
            targetObj.set({ fill: Gradient.fromObject(_oldVal as GradientOptions<'radial'>) })
          }
        } else {
          targetObj.set({ fill: _oldVal })
        }
        targetObj.set({ fill: oldVal })
        canvas.renderAll()
      }
    })
  }
  return { modifyFill }
}
