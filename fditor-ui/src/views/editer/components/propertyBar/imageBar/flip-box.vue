<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import type { FImage } from '@kditor/core'

  const editorStore = useEditorStore()
  const selected = editorStore.selected as FImage
  function flipX() {
    selected.doFlip('x')
  }
  function flipY() {
    selected.doFlip('x')
  }
</script>

<template>
  <div class="flipBox">
    <div @click="flipX">X</div>
    <div @click="flipY">Y</div>
  </div>
</template>

<style scoped lang="scss">
  .flipBox {
    display: flex;
    flex-direction: column;
  }
</style>
