<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import type { FImage } from '@kditor/core'
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
  <div class="flipBox">
    <div class="flipItem" @click="flipX">
      <Flipx></Flipx>
      <span>水平翻转</span>
    </div>
    <div class="flipItem" @click="flipY">
      <Flipy></Flipy>
      <span>垂直翻转</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .flipBox {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    .flipItem {
      padding: 5px;
      border-radius: 5px;
      display: flex;
      column-gap: 4px;
      &:hover {
        background-color: rgba(64, 87, 109, 0.07);
      }
      span {
        font-size: 15px;
        cursor: pointer;
      }
    }
  }
</style>
