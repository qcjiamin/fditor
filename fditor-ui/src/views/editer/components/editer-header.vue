<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { SaveState2ShowString } from '@/utils/constants'
  const editorStore = useEditorStore()
</script>

<template>
  <div class="header">
    <div class="header-left">
      <div class="name">{{ editorStore.projectName }}</div>
      <div class="saveState">{{ SaveState2ShowString[editorStore.saveState] }}</div>
    </div>
    <div class="header-right">
      <button class="preview-btn">preview</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .header {
    height: $EDITER_HEADER_HEIGHT;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgb(22, 23, 26);
    .header-left {
      margin-left: 10px;
      display: flex;
      column-gap: 10px;
      .name {
        color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
      }
      .saveState {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
    }
    .header-right {
      margin-right: 10px;
      .preview-btn {
        display: inline-flex;
        flex-direction: row;
        flex: 0 0 auto;
        position: relative;
        -webkit-box-align: center;
        align-items: center;
        -webkit-box-pack: center;
        justify-content: center;
        padding: 0px 16px;
        height: 40px;
        border-radius: 8px;
        user-select: none;
        font-weight: 600;
        font-size: 14px;
        line-height: 20px;
        transition:
          opacity 0.2s ease-out,
          border-color 0.2s ease-out,
          color 0.2s ease-out,
          background 0.2s ease-out,
          fill 0.2s ease-out,
          box-shadow 0.2s ease-out;
        --border-color: rgba(255, 255, 255, 0.1);
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        min-width: 108px;
        &:not(:disabled):hover {
          // border-color: var(--border-color);
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }
</style>
