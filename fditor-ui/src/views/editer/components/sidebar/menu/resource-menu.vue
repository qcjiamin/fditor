<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import menuItem from './menu-item.vue'
  import { resourceNames, type ResourceName } from '@/utils/constants'
  import { Picture, VideoCamera, Upload, Menu } from '@element-plus/icons-vue'
  import TextIcon from '@/assets/icons/sidebar/text.svg?component'
  import ShapeIcon from '@/assets/icons/sidebar/shape.svg?component'
  import LayerIcon from '@/assets/icons/sidebar/layer.svg?component'
  import type { Component } from 'vue'

  const emit = defineEmits(['tabChange'])
  const editorStore = useEditorStore()
  defineProps<{
    resourceType: ResourceName
  }>()

  function selectResource(tabName: ResourceName) {
    emit('tabChange', tabName)
  }

  // 定义资源类型到图标的映射
  const getResourceIcon = (resourceName: ResourceName): Component => {
    switch (resourceName) {
      case 'image':
        return Picture
      case 'video':
        return VideoCamera
      case 'text':
        return TextIcon
      case 'shape':
        return ShapeIcon
      case 'layer':
        return LayerIcon
      case 'upload':
        return Upload
      default:
        return Menu
    }
  }

  // 定义资源类型到工具提示文本的映射
  const getResourceTooltip = (resourceName: ResourceName) => {
    return resourceName
  }
</script>

<template>
  <div class="resource-menu">
    <!-- <div class="menu-header">
      <h3 class="menu-title">Resources</h3>
    </div> -->
    <div class="menu-items-container">
      <menu-item
        v-for="item of resourceNames"
        :key="item"
        :icon="getResourceIcon(item)"
        :tooltip-text="getResourceTooltip(item)"
        :selected="editorStore.openSidebar && resourceType === item"
        @click="selectResource(item)"
      ></menu-item>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resource-menu {
    width: 72px;
    height: 100%;
    background-color: #f9fafb; // Light gray background similar to Figma
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e7eb; // Subtle border
    padding: 12px 0;
    overflow-y: auto; // 添加滚动条以防内容过多
  }

  // .menu-header {
  //   padding: 0 12px 12px;
  //   border-bottom: 1px solid #e5e7eb;
  //   margin-bottom: 8px;
  //   flex-shrink: 0; // 固定头部大小
  // }

  // .menu-title {
  //   font-size: 12px;
  //   font-weight: 600;
  //   color: #6b7280; // Gray-500
  //   text-transform: uppercase;
  //   letter-spacing: 0.05em;
  // }

  .menu-items-container {
    display: flex;
    flex-direction: column;
    gap: 4px; // Space between items
    padding: 0 4px; // 添加左右内边距防止触碰到边缘
  }
</style>
