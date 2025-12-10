<script lang="ts" setup>
  import flowIcon from '@/assets/icons/resource/flow.svg'
  import { useEditorStore } from '@/stores/editorStore'
  defineProps<{
    title: string
  }>()
  const store = useEditorStore()

  function onClick() {
    store.setOpenSidebar(false)
  }
</script>

<template>
  <div class="resource-header">
    <span>{{ title }}</span>
    <button class="flow-btn" @click="onClick">
      <el-icon size="20">
        <flow-icon></flow-icon>
      </el-icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
  .resource-header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .flow-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 2px 4px;
      background: transparent;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      transition: background-color 0.2s;
      text-align: left;
      color: #1a1a1a;
      font-size: 13px;
      height: 35px;
      width: 35px;
      min-width: 0; // 允许按钮收缩

      .icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        stroke: currentColor;
      }

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0; // 允许文字收缩
      }

      &:hover:not(.disabled) {
        background-color: rgba(54, 55, 73, 0.07);
      }

      &:active:not(.disabled) {
        background-color: rgba(54, 55, 73, 0.09);
      }
    }

    span {
      line-height: 14px;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      text-transform: capitalize;
    }
  }
</style>
