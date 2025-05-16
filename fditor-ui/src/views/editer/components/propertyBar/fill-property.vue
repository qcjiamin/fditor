<script lang="ts" setup>
  import { computed } from 'vue'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  // import colorPicker from '@/components/colorPicker/color-picker.vue'
  import colorBox from '@/components/colorBox/color-box.vue'
  // 引入透明背景图
  // ？为什么这种形式引入的url设置在背景上无效
  // import transparentIcon from '@/assets/transparent.svg?url'
  // 这种形式有效
  // const bgUrl = new URL('@/assets/transparent.svg', import.meta.url).href

  import transparentIcon from '@/assets/transparent.svg'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { createCssLinearGradient, createCssRadialGradient } from '@/utils/common'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  const emit = defineEmits<{
    'update:color': [info: ColorInfo, options: updateColorOptions]
  }>()

  const props = defineProps<{
    color: ColorInfo
  }>()

  function updateColor(info: ColorInfo, options: updateColorOptions) {
    console.log('updateColor in fill-property', info)

    emit('update:color', info, options)
  }

  const cssColor = computed(() => {
    if (props.color.type === 'solid') {
      return props.color.value ? props.color.value : 'rgba(255,255,255,1)'
    } else {
      const gradientInfo = props.color.value
      if (gradientInfo.type === 'linear') {
        return createCssLinearGradient(gradientInfo.degree, ...gradientInfo.colors)
      } else if (gradientInfo.type === 'radial') {
        return createCssRadialGradient(gradientInfo.percent, ...gradientInfo.colors)
      } else {
        return 'rgba(255,255,255,1)'
      }
    }
  })
</script>

<template>
  <property-item show-border>
    <template #anchor>
      <div class="fillAnchor">
        <transparentIcon class="child"></transparentIcon>
        <div class="child" :style="{ background: cssColor }"></div>
      </div>
    </template>
    <template #popup>
      <div class="pickerContainer">
        <!-- <color-picker v-model:color="transferColor"></color-picker> -->
        <color-box :color="props.color" @update:color="updateColor"></color-box>
      </div>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .fillAnchor {
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
</style>
