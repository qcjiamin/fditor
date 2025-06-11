<!-- confirmClip 在裁剪框失焦时会以事件（confirm:clip）的形式通知外部 -->
<script lang="ts" setup>
  import { inject } from 'vue'
  import type { Editor } from '@kditor/core'
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  async function confirmClip() {
    await editor.confirmClip()
    editorStore.setCvsState('normal')
  }
  async function cancelClip() {
    await editor.cancelClip()
    editorStore.setCvsState('normal')
  }
</script>

<template>
  <div class="clipBar">
    <button @click="confirmClip">confirm</button>
    <button @click="cancelClip">cancel</button>
  </div>
</template>

<style scoped lang="scss">
  .clipBar {
    height: 40px;
    width: 100%;
    display: flex;
    column-gap: 5px;
  }
</style>
