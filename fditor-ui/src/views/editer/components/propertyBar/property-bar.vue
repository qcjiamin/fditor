<!-- 按条件动态渲染指定的属性条 -->
<script lang="ts" setup>
  import { type ElementTypes } from '@/utils/types'
  import { computed, inject, onUpdated, type Component, type ComputedRef } from 'vue'
  import bgBar from '@/views/editer/components/propertyBar/bgBar/bg-bar.vue'
  import ShapeBar from '@/views/editer/components/propertyBar/shapeBar/shape-bar.vue'
  import historyBox from '@/views/editer/components/propertyBar/history-box.vue'
  import publicBar from '@/views/editer/components/propertyBar/public-bar.vue'
  import { selectedKey, SelectTypeKey } from '@/constants/injectKey'

  const barComponents: Record<ElementTypes, Component> = {
    bg: bgBar,
    Shape: ShapeBar,
    image: bgBar,
    text: bgBar,
    activeselection: bgBar
  }
  const barRef = inject(SelectTypeKey) as ComputedRef<ElementTypes>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selected = inject(selectedKey)
  onUpdated(() => {
    console.log(barRef.value)
  })
  const showPublicRef = computed(() => barRef.value !== 'bg')
  // const props = withDefaults(defineProps<props>(), {
  //   type: ElementType.Bg
  // })
</script>

<template>
  <div class="propertyBar">
    <history-box></history-box>
    <!-- 条件渲染当前选中元素, 用key当做重新渲染的条件，因为同类元素切换，bar组件不会变 -->
    <component :is="barComponents[barRef]"></component>
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
