<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'

  const emit = defineEmits<{
    'update:radius': [number, options: updateColorOptions]
  }>()
  const { radius } = defineProps<{
    radius: number
  }>()
  const radiusRef = ref(radius)

  watch(
    () => radius,
    (_radius) => {
      radiusRef.value = _radius
    }
  )

  function inputRadius(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:radius', val, { commit: false })
  }

  function updateRadius(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:radius', val, { commit: true })
  }
</script>

<template>
  <div class="radiusBox">
    <div class="item">
      <div>圆角</div>
      <el-slider
        id="radius"
        v-model="radiusRef"
        show-input
        :show-input-controls="false"
        size="small"
        :max="100"
        :min="0"
        @input="inputRadius"
        @change="updateRadius"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .radiusBox {
    width: 200px;
    display: flex;
    flex-direction: column;
    .item {
      :deep(.el-slider__input) {
        width: 60px;
      }
    }
  }
</style>
