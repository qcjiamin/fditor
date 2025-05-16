<!-- 按条件动态渲染指定的属性条 -->
<script lang="ts" setup>
  import { type ElementTypes } from '@/utils/types'
  import { computed, type Component } from 'vue'
  import bgBar from '@/views/editer/components/propertyBar/bgBar/bg-bar.vue'
  import ShapeBar from '@/views/editer/components/propertyBar/shapeBar/shape-bar.vue'
  import historyBox from '@/views/editer/components/propertyBar/history-box.vue'
  import publicBar from '@/views/editer/components/propertyBar/public-bar.vue'
  import { useEditorStore } from '@/stores/editorStore'
  const editorStore = useEditorStore()

  const barComponents: Record<ElementTypes, Component> = {
    bg: bgBar,
    Shape: ShapeBar,
    image: bgBar,
    text: bgBar,
    activeselection: bgBar
  }
  const showPublicRef = computed(() => editorStore.selectType !== 'bg')
</script>

<template>
  <div class="propertyBar">
    <history-box></history-box>
    <!-- 条件渲染当前选中元素, 用key当做重新渲染的条件，因为同类元素切换，bar组件不会变 -->
    <component :is="barComponents[editorStore.selectType]"></component>
    <public-bar v-if="showPublicRef"></public-bar>
  </div>
</template>

<style scoped lang="scss">
  .propertyBar {
    height: 40px;
    width: 100%;
    display: flex;
    column-gap: 5px;
    .typeBar {
      flex-grow: 1;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      column-gap: 5px;
    }
  }
</style>
