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
  <div class="figmaRadiusBox">
    <div class="figmaItem">
      <div class="figmaLabel">圆角</div>
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
        class="figma-slider"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .figmaRadiusBox {
    width: 260px;
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }

  .figmaItem {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .figmaLabel {
      font-size: 12px;
      color: #606266;
      font-weight: 500;
    }

    :deep(.el-slider) {
      margin: 0;
    }

    :deep(.el-slider__input) {
      width: 70px;
      margin-left: 12px;

      .el-input__wrapper {
        height: 28px !important;
        padding: 0 6px !important;
        border-radius: 4px !important;
        border: 1px solid #e0e0e0 !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        background-color: #ffffff;
        transition: all 0.2s ease;

        &:hover {
          border-color: #d0d0d0 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }

        &:focus {
          border-color: #409eff !important;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3) !important;
        }
      }
    }
  }

  .figma-slider {
    :deep(.el-slider__runway) {
      height: 4px;
      background-color: #f0f0f0;
      border-radius: 2px;
      margin: 0;
    }

    :deep(.el-slider__bar) {
      height: 4px;
      background-color: #409eff;
      border-radius: 2px;
    }

    :deep(.el-slider__button) {
      width: 14px;
      height: 14px;
      border: 2px solid #409eff;
      background-color: #fff;
      border-radius: 50%;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    :deep(.el-slider__button:hover) {
      transform: scale(1.2);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
  }
</style>
