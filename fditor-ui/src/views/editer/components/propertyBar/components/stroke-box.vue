<script lang="ts" setup>
  // import type { StrokeConfig } from '@/views/editer/components/propertyBar/types'
  import strokeNoneIcon from '@/assets/icons/stroke-none.svg'
  import stroke0Icon from '@/assets/icons/stroke-0.svg'
  import stroke15Icon from '@/assets/icons/stroke-15.svg'
  import stroke10Icon from '@/assets/icons/stroke-10.svg'
  import stroke5Icon from '@/assets/icons/stroke-5.svg'
  import { ref, watch } from 'vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  const emit = defineEmits<{
    'update:dash': [string]
    'update:strokeWidth': [width: number, options: updateColorOptions]
  }>()
  const { dash, strokeWidth, maxWidth } = defineProps<{
    dash: string
    strokeWidth: number
    maxWidth: number
  }>()
  const dashType = ref(dash)
  watch(
    () => dash,
    (_dash) => {
      dashType.value = _dash
    }
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateDashType(type: any) {
    emit('update:dash', type as string)
  }
  const localStrokeWidth = ref(strokeWidth)
  watch(
    () => strokeWidth,
    (_strokeWidth) => {
      localStrokeWidth.value = _strokeWidth
    }
  )
  // 实际修改
  function updateStrokeWidth(width: number | number[]) {
    if (Array.isArray(width)) throw new Error('get array when set strokeWidth')
    emit('update:strokeWidth', width, { commit: true })
  }
  // preview 修改
  function inputStrokeWidth(width: number | number[]) {
    if (Array.isArray(width)) throw new Error('get array when set strokeWidth')
    localStrokeWidth.value = width
    emit('update:strokeWidth', width, { commit: false })
  }
</script>

<template>
  <div class="figmaStrokeBox">
    <div class="figmaDash">
      <el-radio-group :model-value="dashType" size="small" @update:model-value="updateDashType">
        <el-radio-button label="-1" value="-1"><strokeNoneIcon class="figma-icon"></strokeNoneIcon></el-radio-button>
        <el-radio-button label="0" value="0"><stroke0Icon class="figma-icon"></stroke0Icon></el-radio-button>
        <el-radio-button label="15" value="15"><stroke15Icon class="figma-icon"></stroke15Icon></el-radio-button>
        <el-radio-button label="10" value="10"><stroke10Icon class="figma-icon"></stroke10Icon></el-radio-button>
        <el-radio-button label="5" value="5"><stroke5Icon class="figma-icon"></stroke5Icon></el-radio-button>
      </el-radio-group>
    </div>
    <div class="figmaStrokeWidth">
      <div class="figmaLabel">描边粗细</div>
      <el-slider
        v-model="localStrokeWidth"
        show-input
        :show-input-controls="false"
        size="small"
        :max="Math.floor(maxWidth)"
        @input="inputStrokeWidth"
        @change="updateStrokeWidth"
        class="figma-slider"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .figmaStrokeBox {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    width: 260px;
  }

  .figmaDash {
    :deep(.el-radio-group) {
      display: flex;
      gap: 6px;

      .el-radio-button {
        .el-radio-button__inner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 6px !important;
          border: 1px solid #e0e0e0 !important;
          background-color: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;

          &:hover {
            border-color: #d0d0d0 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          }
        }

        &.is-active .el-radio-button__inner {
          border-color: #409eff !important;
          background-color: #e6f0fa;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
        }
      }
    }
  }

  .figmaStrokeWidth {
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

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
