<!-- confirmClip 在裁剪框失焦时会以事件（confirm:clip）的形式通知外部 -->
<script lang="ts" setup>
  // import { inject } from 'vue'
  // import type { Editor } from '@fditor/core'
  // import { EditorKey } from '@/constants/injectKey'
  // import { useEditorStore } from '@/stores/editorStore'
  import penRightBar from '@/views/editer/components/propertyBar/penBar/pen-right-bar/pen-right-bar.vue'
  import penProperty from '@/views/editer/components/propertyBar/penBar/pen-property/pen-property.vue'
  // const editor = inject<Editor>(EditorKey) as Editor
  // const editorStore = useEditorStore()
</script>

<template>
  <!-- 左右布局，颜色设置在左，模式切换在右 -->
  <div class="figmaClipBar">
    <penProperty></penProperty>
    <penRightBar></penRightBar>
  </div>
</template>

<style scoped lang="scss">
  .figmaClipBar {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
