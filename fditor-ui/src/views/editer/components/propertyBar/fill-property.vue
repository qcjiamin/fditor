<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
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
  const emit = defineEmits(['update:color'])

  const props = defineProps<{
    color: ColorInfo
  }>()
  const transferFill = ref(props.color)

  // 外部修改fill时，向下同步这个状态
  watch(
    () => props.color,
    (_val) => {
      transferFill.value = _val
    },
    {
      deep: true
    }
  )

  watch(transferFill, (_val) => {
    emit('update:color', _val)
  })

  const cssColor = computed(() => {
    console.error('change cssColor')
    if (transferFill.value.type === 'solid') {
      console.error('change cssColor', transferFill.value.value)
      return transferFill.value.value
    } else {
      const gradientInfo = transferFill.value.value
      if (gradientInfo.type === 'linear') {
        console.error('change cssColor', createCssLinearGradient(gradientInfo.degree, ...gradientInfo.colors))
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
        <!-- <color-picker v-model:color="transferFill"></color-picker> -->
        <color-box v-model:color="transferFill"></color-box>
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
