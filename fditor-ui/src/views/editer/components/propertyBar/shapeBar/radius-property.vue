<script lang="ts" setup>
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import RadiusIcon from '@/assets/icons/shapebar/radius.svg'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import radiusBox from '@/views/editer/components/propertyBar/shapeBar/radius-box.vue'

  const emit = defineEmits<{
    'update:radius': [number, options: updateColorOptions]
  }>()

  const { radius = 0, tip = '' } = defineProps<{
    radius: number
    tip?: string
  }>()

  function updateRadius(val: number, options: updateColorOptions) {
    emit('update:radius', val, options)
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <RadiusIcon></RadiusIcon>
    </template>
    <template #popup>
      <radius-box :radius="radius" @update:radius="updateRadius"></radius-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchorIcon {
    width: 100%;
    // height: 30px;
  }
</style>
