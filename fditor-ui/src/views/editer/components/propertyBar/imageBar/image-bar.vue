<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  // import { useEditorStore } from '@/stores/editorStore'
  import type { Editor } from '@kditor/core'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  // const editorStore = useEditorStore()
  // const selected = editorStore.selected as FImage
  function enterCrop() {
    editor.enterCrop()
  }
  function addClippath() {
    editor.doClip()
  }
  function confirmClippath() {
    editor.confirmClip()
  }
  function cancelClippath() {
    editor.cancelClip()
  }
</script>

<template>
  <div>
    <button @click="enterCrop">do</button>
    <button @click="addClippath">clip</button>
    <button @click="confirmClippath">confirm</button>
    <button @click="cancelClippath">cancel</button>
  </div>
</template>

<style scoped lang="scss"></style>
