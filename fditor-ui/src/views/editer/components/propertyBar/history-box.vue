<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  function undo() {
    editor.undo()
  }
  function redo() {
    editor.redo()
  }
</script>

<template>
  <div class="historyBox">
    <button class="undoBtn" @click="undo">U</button>
    <button class="redoBtn" @click="redo">R</button>
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
