<script lang="ts" setup>
  import { ref, watch, type Component } from 'vue'
  import ColorPicker from '@/components/colorPicker/color-picker.vue'
  import GradientPicker from '@/components/gradientPicker/gradient-picker.vue'
  import type { ColorInfo, GradientOption } from '@/views/editer/components/propertyBar/types'
  import type { colorTypes } from '@/components/colorBox/types'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  const props = defineProps<{
    color: ColorInfo
  }>()
  const emit = defineEmits<{
    'update:color': [color: ColorInfo, options: updateColorOptions]
  }>()

  // type 用做页面切换
  const type = ref(props.color.type)

  // const transferColor = ref(props.color)
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
    console.log('updateColor in colorbox', info)
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
  <el-tabs v-model="type" class="tabs">
    <el-tab-pane label="solid" name="solid"></el-tab-pane>
    <el-tab-pane label="gradient" name="gradient"></el-tab-pane>
  </el-tabs>

  <div class="colorBox">
    <div class="colorType">
      <component
        :is="pickerComponents[props.color.type]"
        :color="props.color.value"
        @update:color="updateColor"
      ></component>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
