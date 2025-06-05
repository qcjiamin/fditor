<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@kditor/core'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  function enterCrop() {
    editor.enterCrop()
  }
</script>

<template>
  <div><button @click="enterCrop">do</button></div>
</template>

<style scoped lang="scss"></style>
