<script lang="ts" setup>
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import transparentIcon from '@/assets/transparent.svg'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { ref, watch } from 'vue'

  const emit = defineEmits<{
    'update:opacity': [info: number, options: updateColorOptions]
  }>()

  const { opacity, tip = '' } = defineProps<{
    opacity: number
    tip?: string
  }>()
  const opacityRef = ref(opacity * 100)
  watch(
    () => opacity,
    (newVal: number) => (opacityRef.value = newVal * 100)
  )

  function updateOpacity(opacity: number, options: updateColorOptions) {
    emit('update:opacity', opacity / 100, options)
  }
  function changeHandle(val: number | number[]) {
    if (Array.isArray(val)) throw new Error('opacity need number')
    updateOpacity(val, { commit: true })
  }
  function inputHandle(val: number | number[]) {
    if (Array.isArray(val)) throw new Error('opacity need number')
    opacityRef.value = val
    updateOpacity(val, { commit: false })
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <div class="anchor">
        <transparentIcon class="child"></transparentIcon>
      </div>
    </template>
    <template #popup>
      <div class="pickerContainer">
        <el-slider
          :model-value="opacityRef"
          show-input
          :show-input-controls="false"
          size="small"
          :max="100"
          @input="inputHandle"
          @change="changeHandle"
        />
      </div>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchor {
    width: 100%;
    height: 100%;
    position: relative;
    .child {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }
  }
  .pickerContainer {
    width: 190px;
  }
  :deep(.el-slider__input) {
    width: 50px;
  }
</style>
