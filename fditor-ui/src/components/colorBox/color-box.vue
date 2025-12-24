<script lang="ts" setup>
  import { ref, watch, type Component } from 'vue'
  import ColorPicker from '@/components/colorPicker/color-picker.vue'
  import GradientPicker from '@/components/gradientPicker/gradient-picker.vue'
  import type { ColorInfo, GradientOption } from '@/views/editer/components/propertyBar/types'
  import type { colorTypes } from '@/components/colorBox/types'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  const { color, enableGradient = true } = defineProps<{
    color: ColorInfo
    enableGradient: boolean
  }>()
  const emit = defineEmits<{
    'update:color': [color: ColorInfo, options: updateColorOptions]
  }>()

  // type 用做页面切换
  const type = ref(color.type)
  const pickerComponents: Record<colorTypes, Component> = {
    solid: ColorPicker,
    gradient: GradientPicker
  }

  // 类型切换时，恢复对应类型的默认值
  //todo: 保留之前类型的值
  watch(
    () => type.value,
    (newType, oldType) => {
      if (newType !== oldType) {
        if (newType === 'solid') {
          // 默认色
          emit(
            'update:color',
            {
              type: 'solid',
              value: 'rgba(255, 255, 255, 1)'
            },
            { commit: true }
          )
        } else {
          emit(
            'update:color',
            {
              type: 'gradient',
              value: {
                type: 'linear',
                units: 'pixels',
                colors: ['rgba(255,255,255,1)', 'rgba(0,0,0,1)'],
                degree: 90
              }
            },
            { commit: true }
          )
        }
      }
    }
  )

  function updateColor(info: GradientOption<'linear'> | GradientOption<'radial'> | string, option: updateColorOptions) {
    if (typeof info === 'string') {
      emit(
        'update:color',
        {
          type: 'solid',
          value: info
        },
        option
      )
    } else {
      emit(
        'update:color',
        {
          type: 'gradient',
          value: info
        },
        option
      )
    }
  }
</script>

<template>
  <el-tabs v-if="enableGradient" v-model="type" class="tabs" type="card" stretch>
    <el-tab-pane label="Solid" name="solid"></el-tab-pane>
    <el-tab-pane label="Gradient" name="gradient"></el-tab-pane>
  </el-tabs>

  <div class="colorBox">
    <div class="colorType">
      <component :is="pickerComponents[color.type]" :color="color.value" @update:color="updateColor"></component>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 12px 0;
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-tabs__nav-wrap)::after {
      height: 1px;
      background-color: #e4e7ed;
    }

    :deep(.el-tabs__item) {
      padding: 8px 16px;
      color: #606266;
      font-size: 13px;
      font-weight: 500;
      border: none;
      transition: all 0.2s ease;

      &.is-active {
        color: #409eff;
        background-color: transparent;
        border: none;
      }

      &:not(.is-active):hover {
        color: #409eff;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: #409eff;
      height: 2px;
    }
  }

  .colorBox {
    min-height: 200px;
  }

  .colorType {
    border-radius: 8px;
    overflow: hidden;
  }
</style>
