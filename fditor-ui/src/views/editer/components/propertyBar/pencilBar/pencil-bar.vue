<!-- confirmClip 在裁剪框失焦时会以事件（confirm:clip）的形式通知外部 -->
<script lang="ts" setup>
  // import { inject } from 'vue'
  // import type { Editor } from '@fditor/core'
  // import { EditorKey } from '@/constants/injectKey'
  // import { useEditorStore } from '@/stores/editorStore'
  import linewidthProperty from '@/views/editer/components/propertyBar/pencilBar/components/linewidth-property.vue'
  // import { watch } from 'vue'

  // const editor = inject(EditorKey) as Editor
  // const editorStore = useEditorStore()
  // watch(
  //   () => editorStore.canvasMode,
  //   (newState) => {
  //     console.log(newState, 11111)
  //     if (newState === 'pencil') {
  //       editorStore.setCvsState('pencil')
  //     } else if (newState === 'pen') {
  //       console.log('pen mode')
  //     } else {
  //       editorStore.setCvsState('normal')
  //     }
  //   }
  // )
</script>

<template>
  <div class="figmaClipBar">
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
