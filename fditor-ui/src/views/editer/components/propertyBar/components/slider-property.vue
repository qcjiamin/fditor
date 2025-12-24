<script lang="ts" setup>
  import propertyItem from '@/views/editer/components/propertyBar/components/property-item.vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { computed } from 'vue'

  const emit = defineEmits<{
    'update:modelValue': [val: number]
    change: [val: number, options: updateColorOptions]
  }>()

  const props = withDefaults(
    defineProps<{
      modelValue: number
      tip?: string
      min?: number
      max?: number
      step?: number
    }>(),
    {
      tip: '',
      min: 0,
      max: 100,
      step: 1
    }
  )

  const localValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  function changeHandle(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:modelValue', val)
    emit('change', val, { commit: true })
  }

  function inputHandle(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:modelValue', val)
    emit('change', val, { commit: false })
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <div class="figmaAnchor">
        <slot name="icon">
          <!-- Default fallback if needed, or just empty -->
        </slot>
      </div>
    </template>
    <template #popup>
      <div class="figmaPickerContainer">
        <el-slider
          v-model="localValue"
          show-input
          :show-input-controls="false"
          size="small"
          :min="min"
          :max="max"
          :step="step"
          class="figma-slider"
          @input="inputHandle"
          @change="changeHandle"
        />
      </div>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .figmaAnchor {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Ensure slotted icon fills parent if designed like opacity-property */
    :deep(> *) {
      width: 100%;
      height: 100%;
    }
  }

  /* Reusing styles from opacity-property.vue exactly as requested */
  .figmaPickerContainer {
    width: 240px;
    padding: 12px;

    :deep(.el-slider) {
      margin: 0;
    }
    :deep(.el-slider__input) {
      width: 60px;
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
