<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'
  import { inject, onMounted, onUnmounted, reactive } from 'vue'
  import undoIcon from '@/assets/icons/historybar/undo.svg'
  import redoIcon from '@/assets/icons/historybar/redo.svg'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'

  const editor = inject(EditorKey) as Editor
  function undo() {
    editor.undo()
  }
  function redo() {
    editor.redo()
  }
  const able = reactive({
    canUndo: false,
    canRedo: false
  })
  function updateState() {
    const len = editor.getHistoryList().length
    const currentIdx = editor.getHistoryIndex()
    able.canUndo = currentIdx !== 0
    able.canRedo = currentIdx !== len - 1
  }

  onMounted(() => {
    editor.on('historyIndex:update', updateState)
  })
  onUnmounted(() => {
    editor.off('historyIndex:update', updateState)
  })
</script>

<template>
  <div class="historyBox">
    <property-normal-item tip="undo" :disable="!able.canUndo" @click="undo">
      <undoIcon></undoIcon>
    </property-normal-item>
    <property-normal-item tip="redo" :disable="!able.canRedo" @click="redo">
      <redoIcon></redoIcon>
    </property-normal-item>
  </div>
</template>

<style scoped lang="scss">
  .historyBox {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    // justify-content: center;
    align-items: center;
    column-gap: 5px;
    .colorBtn {
      width: 30px;
      height: 30px;
      background-color: aqua;
    }
  }
</style>
