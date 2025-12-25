<!-- confirmClip 在裁剪框失焦时会以事件（confirm:clip）的形式通知外部 -->
<script lang="ts" setup>
  import { inject } from 'vue'
  import type { Editor } from '@fditor/core'
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { Close } from '@element-plus/icons-vue'
  const editor = inject<Editor>(EditorKey) as Editor
  const editorStore = useEditorStore()
  function exitPen() {
    if (!editor.stage.pen) return
    editor.leavePenMode()
    editorStore.canvasMode = 'move'
  }
</script>

<template>
  <div class="figmaClipBar">
    <propertyNormalItem tip="finish" @click="exitPen">
      <Close></Close>
    </propertyNormalItem>
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
