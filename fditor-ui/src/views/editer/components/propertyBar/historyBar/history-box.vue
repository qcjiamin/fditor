<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'
  import { inject } from 'vue'
  import undoIcon from '@/assets/icons/historybar/undo.svg'
  import redoIcon from '@/assets/icons/historybar/redo.svg'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import { storeToRefs } from 'pinia'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  const { canUndo, canRedo } = storeToRefs(editorStore)
  function undo() {
    // editor.undo()
    editorStore.undo()
  }
  function redo() {
    // editor.redo()
    editorStore.redo()
  }
  // const able = reactive({
  //   canUndo: false,
  //   canRedo: false
  // })
  // function updateState() {
  //   const len = editor.getHistoryList().length
  //   const currentIdx = editor.getHistoryIndex()
  //   able.canUndo = currentIdx !== 0
  //   able.canRedo = currentIdx !== len - 1
  // }

  // onMounted(() => {
  //   editor.on('historyIndex:update', updateState)
  // })
  // onUnmounted(() => {
  //   editor.off('historyIndex:update', updateState)
  // })
</script>

<template>
  <div class="historyBox">
    <property-normal-item tip="undo" :disable="!canUndo" @click="undo">
      <undoIcon class="figma-icon"></undoIcon>
    </property-normal-item>
    <property-normal-item tip="redo" :disable="!canRedo" @click="redo">
      <redoIcon class="figma-icon"></redoIcon>
    </property-normal-item>
  </div>
</template>

<style scoped lang="scss">
  .historyBox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
