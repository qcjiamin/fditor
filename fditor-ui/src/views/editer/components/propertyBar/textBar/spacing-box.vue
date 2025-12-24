<script lang="ts" setup>
  import { ref } from 'vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'

  const emit = defineEmits<{
    'update:charSpacing': [number, options: updateColorOptions]
    'update:lineHeight': [number, options: updateColorOptions]
  }>()
  const { charSpacing, lineHeight } = defineProps<{
    charSpacing: number
    lineHeight: number
  }>()
  const charSpacingRef = ref(charSpacing)
  const lineHeightRef = ref(lineHeight)

  function inputCharSpacing(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:charSpacing', val, { commit: false })
  }

  function updateCharSpacing(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:charSpacing', val, { commit: true })
  }

  function inputLineHeight(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:lineHeight', val, { commit: false })
  }
  function updateLineHeight(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:lineHeight', val, { commit: true })
  }
</script>

<template>
  <div class="spacingBox">
    <div class="spacingItem">
      <div class="label">Character Spacing</div>
      <el-slider
        id="charspacing"
        v-model="charSpacingRef"
        show-input
        :show-input-controls="false"
        size="small"
        :max="800"
        :min="-200"
        class="figma-slider"
        @input="inputCharSpacing"
        @change="updateCharSpacing"
      />
    </div>
    <div class="spacingItem">
      <div class="label">Line Height</div>
      <el-slider
        id="lineheight"
        v-model="lineHeightRef"
        show-input
        :show-input-controls="false"
        size="small"
        :min="0.5"
        :max="2.5"
        :step="0.01"
        class="figma-slider"
        @input="inputLineHeight"
        @change="updateLineHeight"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .spacingBox {
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;

    .spacingItem {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .label {
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
