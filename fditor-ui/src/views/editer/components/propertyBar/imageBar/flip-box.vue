<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import type { FImage } from '@fditor/core'
  import Flipx from '@/assets/icons/imgbar/flipx.svg'
  import Flipy from '@/assets/icons/imgbar/flipy.svg'

  const editorStore = useEditorStore()
  const selected = editorStore.selected as FImage
  function flipX() {
    selected.doFlip('x')
  }
  function flipY() {
    selected.doFlip('y')
  }
</script>

<template>
  <div class="figmaFlipBox">
    <div class="figmaFlipItem" @click="flipX">
      <Flipx class="figma-icon"></Flipx>
      <span>水平翻转</span>
    </div>
    <div class="figmaFlipItem" @click="flipY">
      <Flipy class="figma-icon"></Flipy>
      <span>垂直翻转</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .figmaFlipBox {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    min-width: 120px;
  }

  .figmaFlipItem {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f5f7fa;
    }

    span {
      font-size: 13px;
      color: #303133;
    }
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
