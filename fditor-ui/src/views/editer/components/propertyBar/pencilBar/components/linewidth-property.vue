<script lang="ts" setup>
  import sliderProperty from '@/views/editer/components/propertyBar/components/slider-property.vue'
  import { inject, watch } from 'vue'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'
  import lineWidthIcon from '@/assets/icons/pencilbar/lineWidth.svg'
  import { useEditorStore } from '@/stores/editorStore'
  import type { updateColorOptions } from '@/components/colorPicker/types'

  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()

  function changeLineWidth(value: number, { commit }: updateColorOptions) {
    if (!editor.stage.freeDrawingBrush) return
    editorStore.setBrushStyleByKey('lineWidth', value)
    if (commit) {
      // 关联history
    }
  }
  watch(
    () => editorStore.brushStyle.lineWidth,
    (val) => {
      if (!editor.stage.freeDrawingBrush) return
      editor.stage.freeDrawingBrush.width = val
    }
  )
</script>
<template>
  <slider-property
    :model-value="editorStore.brushStyle.lineWidth"
    :tip="'lineWidth'"
    :min="1"
    :max="100"
    :step="1"
    @change="changeLineWidth"
  >
    <template #icon>
      <lineWidthIcon></lineWidthIcon>
    </template>
  </slider-property>
</template>

<style scoped lang="scss"></style>
