<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@kditor/core'
  import { inject } from 'vue'
  import type { KonvaNode } from '../../../../../../core/types'

  const editor = inject(EditorKey) as Editor
  function deleteObj() {
    console.log('delete')
    editor.remove(...(editor.getActiveShapes() as KonvaNode[]))
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
