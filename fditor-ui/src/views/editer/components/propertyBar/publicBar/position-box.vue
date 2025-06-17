<script lang="ts" setup>
  import LeftIcon from '@/assets/icons/publicbar/align_left.svg'
  import CenterIcon from '@/assets/icons/publicbar/align_center.svg'
  import RightIcon from '@/assets/icons/publicbar/align_right.svg'
  import TopIcon from '@/assets/icons/publicbar/align_top.svg'
  import MiddleIcon from '@/assets/icons/publicbar/align_middle.svg'
  import BottomIcon from '@/assets/icons/publicbar/align_bottom.svg'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import type { HorizontalAlign, VerticalAlign } from '@fditor/core'
  import { ref, watch } from 'vue'

  const emit = defineEmits<{
    'update:align': [HorizontalAlign | VerticalAlign]
  }>()
  const { horizontal, vertical } = defineProps<{
    horizontal: HorizontalAlign | ''
    vertical: VerticalAlign | ''
  }>()
  const horizontalRef = ref(horizontal)
  const verticalRef = ref(vertical)
  watch(
    () => horizontal,
    (_horizontal) => {
      horizontalRef.value = _horizontal
    }
  )
  watch(
    () => vertical,
    (_vertical) => {
      verticalRef.value = _vertical
    }
  )

  function doAlgin(type: HorizontalAlign | VerticalAlign) {
    emit('update:align', type)
  }
</script>
<!-- tood: 进一步封装 property-normal-item  为AlignItem, 点击事件包装在里面 -->
<template>
  <div class="positionBox">
    <property-normal-item tip="left" :active="horizontalRef === 'left'" @click="doAlgin('left')"
      ><LeftIcon
    /></property-normal-item>
    <property-normal-item tip="center" :active="horizontalRef === 'center'" @click="doAlgin('center')"
      ><CenterIcon
    /></property-normal-item>
    <property-normal-item tip="right" :active="horizontalRef === 'right'" @click="doAlgin('right')"
      ><RightIcon
    /></property-normal-item>
    <div class="line"></div>
    <property-normal-item tip="top" :active="verticalRef === 'top'" @click="doAlgin('top')"
      ><TopIcon
    /></property-normal-item>
    <property-normal-item tip="middle" :active="verticalRef === 'middle'" @click="doAlgin('middle')"
      ><MiddleIcon
    /></property-normal-item>
    <property-normal-item tip="bottom" :active="verticalRef === 'bottom'" @click="doAlgin('bottom')"
      ><BottomIcon
    /></property-normal-item>
  </div>
</template>

<style scoped lang="scss">
  .positionBox {
    display: flex;
    column-gap: 5px;
    .line {
      width: 2px;
      height: 24px;
      background-color: rgb(237, 237, 237);
    }
  }
</style>
