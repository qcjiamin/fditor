<script lang="ts" setup>
  import sliderProperty from '@/views/editer/components/propertyBar/components/slider-property.vue'
  import { inject, ref } from 'vue'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'
  import lineWidthIcon from '@/assets/icons/pencilbar/lineWidth.svg'

  const editor = inject(EditorKey) as Editor

  const lineWidth = ref(1)
  function changeLineWidth(value: number) {
    if (!editor.stage.freeDrawingBrush) return
    editor.stage.freeDrawingBrush.width = value
  }
</script>
<template>
  <slider-property
    v-model:model-value="lineWidth"
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
