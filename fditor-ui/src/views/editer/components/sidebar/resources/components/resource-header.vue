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
    padding: 0 12px; // Add horizontal padding to match Figma style
    border-bottom: 1px solid #e5e7eb; // Subtle border similar to resource-menu.vue

    .flow-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px; // More consistent padding
      background: transparent;
      border: 1px solid transparent; // Start with transparent border
      border-radius: 6px; // Softer rounded corners
      cursor: pointer;
      transition: all 0.2s;
      color: #6b7280; // Muted color for icon
      width: 32px;
      height: 32px;

      &:hover:not(.disabled) {
        background-color: #f3f4f6; // Light hover state
        border-color: #d1d5db; // Subtle border on hover
        color: #374151; // Darker on hover
      }

      &:active:not(.disabled) {
        background-color: #e5e7eb; // Slightly more active state
      }
    }

    span {
      font-size: 14px;
      font-weight: 500; // Slightly less bold for cleaner look
      color: #374151; // Use more consistent gray
      text-transform: capitalize;
    }
  }
</style>
