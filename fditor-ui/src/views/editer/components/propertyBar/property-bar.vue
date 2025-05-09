<!-- 按条件动态渲染指定的属性条 -->
<script lang="ts" setup>
  import { type ElementTypes } from '@/utils/types'
  import { inject, onMounted, type Component, type ComputedRef } from 'vue'
  import bgBar from '@/views/editer/components/propertyBar/bgBar/bg-bar.vue'
  import ShapeBar from '@/views/editer/components/propertyBar/shapeBar/shape-bar.vue'
  import historyBox from '@/views/editer/components/propertyBar/history-box.vue'
  import publicBar from '@/views/editer/components/propertyBar/public-bar.vue'
  import { SelectTypeKey } from '@/constants/injectKey'

  interface props {
    type: ElementTypes
  }
  const { type = 'bg' } = defineProps<props>()
  const barComponents: Record<ElementTypes, Component> = {
    bg: bgBar,
    Shape: ShapeBar,
    image: bgBar,
    text: bgBar,
    group: bgBar
  }
  const barRef = inject(SelectTypeKey) as ComputedRef<ElementTypes>
  // const props = withDefaults(defineProps<props>(), {
  //   type: ElementType.Bg
  // })
  onMounted(() => {
    console.log(type)
  })
</script>

<template>
  <div class="propertyBar">
    <history-box></history-box>
    <!-- 条件渲染当前选中元素 -->
    <component :is="barComponents[barRef]"></component>
    <public-bar></public-bar>
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
