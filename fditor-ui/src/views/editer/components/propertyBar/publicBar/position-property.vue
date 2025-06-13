<script lang="ts" setup>
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import PositionIcon from '@/assets/icons/publicbar/public_position.svg'
  import positionBox from '@/views/editer/components/propertyBar/publicBar/position-box.vue'
  import type { HorizontalAlign, VerticalAlign } from '@kditor/core'
  import { ref, watch } from 'vue'

  const emit = defineEmits<{
    'update:align': [HorizontalAlign | VerticalAlign]
  }>()

  const {
    horizontal,
    vertical,
    tip = ''
  } = defineProps<{
    horizontal: HorizontalAlign | ''
    vertical: VerticalAlign | ''
    tip?: string
  }>()

  //! 为了数据自上而下流动
  const horizontalRef = ref(horizontal)
  watch(
    () => horizontal,
    (_horizontal) => {
      horizontalRef.value = _horizontal
    }
  )
  const verticalRef = ref(vertical)
  watch(
    () => vertical,
    (_vertical) => {
      verticalRef.value = _vertical
    }
  )

  function updateAlign(val: HorizontalAlign | VerticalAlign) {
    emit('update:align', val)
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <PositionIcon></PositionIcon>
    </template>
    <template #popup>
      <position-box :horizontal="horizontalRef" :vertical="verticalRef" @update:align="updateAlign"></position-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchorIcon {
    width: 100%;
    // height: 30px;
  }
</style>
