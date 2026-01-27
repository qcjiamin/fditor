<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { Close } from '@element-plus/icons-vue'
  import type { Editor, subPenType } from '@fditor/core'
  import { inject } from 'vue'
  import selectIcon from '@/assets/icons/penbar/select.svg'
  import penIcon from '@/assets/icons/penbar/pen.svg'
  import curveIcon from '@/assets/icons/penbar/curve.svg'
  const editor = inject<Editor>(EditorKey) as Editor
  const editorStore = useEditorStore()

  function switchSubType(type: subPenType) {
    if (!editor.stage.pen) return
    editor.stage.pen.switchSubtype(type)
  }
  function exitPen() {
    if (!editor.stage.pen) return
    // editor.leavePenMode()
    editorStore.setCanvasMode('move')
  }
</script>

<template>
  <div class="box">
    <propertyNormalItem :active="editorStore.penSubType === 'select'" @click="switchSubType('select')"
      ><selectIcon
    /></propertyNormalItem>
    <propertyNormalItem :active="editorStore.penSubType === 'pen'" tip="pen" @click="switchSubType('pen')"
      ><penIcon
    /></propertyNormalItem>
    <propertyNormalItem :active="editorStore.penSubType === 'curve'" tip="curve" @click="switchSubType('curve')"
      ><curveIcon
    /></propertyNormalItem>
    <propertyNormalItem tip="finish" @click="exitPen">
      <Close></Close>
    </propertyNormalItem>
  </div>
</template>

<style scoped lang="scss">
  .box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }
</style>
