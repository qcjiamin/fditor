<!-- confirmClip 在裁剪框失焦时会以事件（confirm:clip）的形式通知外部 -->
<script lang="ts" setup>
  import { computed, inject } from 'vue'
  import type { Editor } from '@fditor/core'
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import linewidthProperty from '@/views/editer/components/propertyBar/pencilBar/components/linewidth-property.vue'
  import fillProperty from '@/views/editer/components/propertyBar/components/fill-property.vue'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { watch } from 'vue'
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor

  const brushColorInfo = computed<ColorInfo>(() => {
    return {
      type: 'solid',
      value: editorStore.brushStyle.color
    }
  })
  function setBrushColor(info: ColorInfo, { commit }: updateColorOptions) {
    if (!editor.stage.freeDrawingBrush) return
    if (info.type === 'solid') {
      if (!info.value) throw new Error('color null')
      editorStore.setBrushStyleByKey('color', info.value)
      if (commit) {
        editor.stage.freeDrawingBrush.color = info.value
        //todo: 通知外层颜色修改了, 与history关联
      }
    }
  }
  // 如果画刷颜色改变，则同步给画笔
  watch(
    () => editorStore.brushStyle.color,
    (val) => {
      if (!editor.stage.freeDrawingBrush) return
      editor.stage.freeDrawingBrush.color = val
    }
  )
</script>

<template>
  <div class="figmaClipBar">
    <fill-property :color="brushColorInfo" :enable-gradient="false" @update:color="setBrushColor"></fill-property>
    <linewidth-property></linewidth-property>
    <!-- <button @click="confirmClip">confirm</button>
    <button @click="cancelClip">cancel</button> -->
  </div>
</template>

<style scoped lang="scss">
  .figmaClipBar {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
