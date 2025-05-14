<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@kditor/core'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  function deleteObj() {
    console.log('delete')
    const activeObj = editor.stage.getActiveObject()
    if (!activeObj) throw new Error('delete, but no object was selected ')
    editor.remove(activeObj)
  }
</script>

<template>
  <div class="historyBox">
    <button class="lock">L</button>
    <button class="delete" @click="deleteObj">D</button>
  </div>
</template>

<style scoped lang="scss">
  .historyBox {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    column-gap: 5px;
    .delete {
      width: 30px;
      height: 30px;
      background-color: aqua;
    }
    .lock {
      width: 30px;
      height: 30px;
      background-color: aqua;
    }
  }
</style>
