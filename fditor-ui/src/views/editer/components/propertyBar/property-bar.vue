<!-- 按条件动态渲染指定的属性条 -->
<script lang="ts" setup>
  import { type ElementTypes } from '@/utils/types'
  import { computed, type Component } from 'vue'
  import bgBar from '@/views/editer/components/propertyBar/bgBar/bg-bar.vue'
  import ShapeBar from '@/views/editer/components/propertyBar/shapeBar/shape-bar.vue'
  import historyBox from '@/views/editer/components/propertyBar/historyBar/history-box.vue'
  import publicBar from '@/views/editer/components/propertyBar/publicBar/public-bar.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import textBar from '@/views/editer/components/propertyBar/textBar/text-bar.vue'
  import imageBar from '@/views/editer/components/propertyBar/imageBar/image-bar.vue'
  import ActiveSelectionBar from '@/views/editer/components/propertyBar/activeSelectionBar/activeSelection-bar.vue'
  import GroupBar from '@/views/editer/components/propertyBar/groupBar/group-bar.vue'
  import PathBar from '@/views/editer/components/propertyBar/pathBar/path-bar.vue'
  const editorStore = useEditorStore()

  const barComponents: Record<ElementTypes, Component> = {
    bg: bgBar,
    Shape: ShapeBar,
    image: imageBar,
    text: textBar,
    path: PathBar,
    activeselection: ActiveSelectionBar,
    group: GroupBar,
    fpenpath: PathBar
  }
  const showPublicRef = computed(() => editorStore.selectType !== 'bg')
</script>

<template>
  <div class="propertyBar">
    <history-box></history-box>
    <!-- 条件渲染当前选中元素, 用key当做重新渲染的条件，因为同类元素切换，bar组件不会变 -->
    <component :is="barComponents[editorStore.selectType]" :key="editorStore.selected"></component>
    <public-bar v-if="showPublicRef"></public-bar>
  </div>
</template>

<style scoped lang="scss">
  .propertyBar {
    height: 48px; // Slightly taller to accommodate the larger components
    width: 100%;
    display: flex;
    align-items: center; // Center items vertically
    padding: 0 12px; // Add horizontal padding for better visual balance
    column-gap: 8px; // Match design system spacing
    background-color: #ffffff; // Cleaner background following Figma's approach
    border-bottom: 1px solid #e4e7ed; // Add subtle bottom border for separation
    box-sizing: border-box; // Ensure padding is included in height

    .typeBar {
      flex-grow: 1;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      column-gap: 8px; // Match design system spacing
    }
  }
</style>
