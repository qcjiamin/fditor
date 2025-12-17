<script lang="ts" setup>
  import { ElTooltip, ElIcon } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { Component } from 'vue'

  defineProps<{
    icon?: Component // 支持图标字符串或SVG对象
    tooltipText?: string
    selected: boolean
  }>()

  defineEmits<{
    click: []
  }>()
</script>

<template>
  <el-tooltip :content="tooltipText" placement="right" effect="light">
    <div class="menu-item" :class="{ selected: selected }" @click="$emit('click')">
      <el-icon class="menu-icon">
        <component :is="icon || QuestionFilled" />
      </el-icon>
    </div>
  </el-tooltip>
</template>

<style scoped lang="scss">
  .menu-item {
    user-select: none;
    width: calc(100% - 8px); /* 减去margin空间，防止超出边界 */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
    border-radius: 6px;
    margin: 2px 4px; /* 减小margin防止超出 */
    transition: all 0.2s ease-in-out;
    box-sizing: border-box; /* 确保padding和border包含在元素宽度内 */

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    &.selected {
      background-color: #e0e7ff; /* 更柔和的选中颜色 */
      color: #4f46e5; /* 主题色 */
    }

    .menu-icon {
      font-size: 18px; /* 适当调整图标大小 */
      color: #374151; /* Gray-700 */

      .selected & {
        color: #4f46e5; /* 主题色 */
      }
    }
  }

  :deep(.el-tooltip) {
    width: 100%;
    height: 100%;
  }
</style>
