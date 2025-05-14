<script lang="ts" setup>
  // import colorPicker from '@/components/colorPicker/color-picker.vue'

  import { ref, watch, type Component } from 'vue'
  import ColorPicker from '@/components/colorPicker/color-picker.vue'
  import GradientPicker from '@/components/gradientPicker/gradient-picker.vue'
  // import { createLinearGradient, type colorVal } from '@kditor/core'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import type { colorTypes } from '@/components/colorBox/types'
  // import type { TabsPaneContext } from 'element-plus'
  const props = defineProps<{
    color: ColorInfo
  }>()
  const emit = defineEmits(['update:color'])

  // 初始化时需要
  // 手动切换时需要
  // const colorType = ref<colorTypes>('solid')
  const transferColor = ref(props.color)
  const pickerComponents: Record<colorTypes, Component> = {
    solid: ColorPicker,
    gradient: GradientPicker
  }

  watch(
    () => transferColor.value.type,
    (newType, oldType) => {
      if (newType !== oldType) {
        if (newType === 'solid') {
          // 默认色
          transferColor.value.value = 'rgba(255, 255, 255, 1)'
        } else {
          transferColor.value.value = {
            type: 'linear',
            units: 'pixels',
            colors: ['rgba(255,255,255,1)', 'rgba(0,0,0,1)'],
            degree: 90
          }
        }
      }
    }
  )

  watch(
    transferColor,
    (_color) => {
      emit('update:color', _color)
    },
    { deep: true }
  )
</script>

<template>
  <el-tabs v-model="transferColor.type" class="tabs">
    <el-tab-pane label="solid" name="solid"></el-tab-pane>
    <el-tab-pane label="gradient" name="gradient"></el-tab-pane>
  </el-tabs>

  <div class="colorBox">
    <div class="colorType">
      <component :is="pickerComponents[transferColor.type]" v-model:color="transferColor.value"></component>
      <!-- <ColorPicker v-if="transferColor.type === 'solid'" v-model:color="transferColor.value" />
      <GradientPicker v-else v-model:color="transferColor.value" /> -->
    </div>
    <!-- 组件切换 -->
  </div>
</template>

<style scoped lang="scss"></style>
