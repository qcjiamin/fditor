<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { type Editor } from '@fditor/core'
  import { Textbox } from 'fabric'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  function addText() {
    const text = new Textbox('TEXT', {
      fontSize: 100
    })
    editor.add(text)
  }
</script>

<template>
  <div class="resouceTextBox">
    <div class="block">
      <div class="title">默认</div>
      <div class="content">
        <div class="box" @click="addText">默认文字</div>
      </div>
    </div>
    <div class="block">
      <div class="title">文字组合</div>
      <div class="box"> </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resouceTextBox {
    // padding-top: 8px;
    padding: 8px 0 16px 16px;
    width: 100%;
    background-color: $TAB_BGCOLOR;
    height: 100%;
    display: flex;
    flex-direction: column;
    .block {
      width: 100%;
      margin-bottom: 1rem;
      .title {
        color: $TAB_TITLE_COLOR;
        font-size: $TAB_TITLE_FONTSIZE;
        margin-bottom: 7px;
      }
      .content {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        .box {
          color: white;
          width: 70px;
          height: 70px;
          border-radius: 5px;
          background-color: rgb(117, 113, 113);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          &:hover {
            background-color: rgb(65, 64, 64);
            cursor: default;
          }
        }
      }
    }
  }
</style>
