<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import type { Editor } from '@kditor/core'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  // const selected = editorStore.selected as FImage
  function addClippath() {
    editorStore.setCvsState('clip')
    editor.doClip()
  }
</script>

<template>
  <div>
    <button @click="addClippath">clip</button>
  </div>
</template>

<style scoped lang="scss"></style>
