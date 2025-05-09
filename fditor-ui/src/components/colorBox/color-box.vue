<script lang="ts" setup>
  // import colorPicker from '@/components/colorPicker/color-picker.vue'
  import type { konvaFill } from '../../../../core/types'
  import { onBeforeMount, ref, watch } from 'vue'
  import type { colorTypes } from '@/components/colorBox/types'
  // import type { TabsPaneContext } from 'element-plus'
  const props = defineProps<{
    color: konvaFill
  }>()

  // 初始化时需要
  // 手动切换时需要
  const colorType = ref<colorTypes>('solid')
  const transferColor = ref(props.color)

  onBeforeMount(() => {
    colorType.value = getColorType(props.color)
  })

  function getColorType(color: konvaFill): colorTypes {
    if (typeof color === 'string') {
      return 'solid'
    } else {
      return 'gradient'
    }
  }
  watch(colorType, () => {
    const type = getColorType(transferColor.value)
    if (type !== colorType.value) {
      if (colorType.value === 'solid') {
        // 默认色
        transferColor.value = 'rgba(255, 255, 255, 1)'
      } else {
        // const gradient = new CanvasGradient()
        // transferColor.value = new CanvasGradient()
      }
    }
  })

  watch(transferColor, (_color) => {
    console.log(_color)
  })

  // function tabClick(tab: TabsPaneContext, event: Event) {
  //   console.log(tab, event)
  // }
  // onUpdated(() => {
  //   console.log(colorType.value)
  // })
</script>

<template>
  <el-tabs v-model="colorType" class="tabs">
    <el-tab-pane label="solid" name="solid">solid</el-tab-pane>
    <el-tab-pane label="gradient" name="gradient">gradient</el-tab-pane>
  </el-tabs>

  <div class="colorBox">
    <div class="colorType"> </div>
    <!-- 组件切换 -->
  </div>
</template>

<style scoped lang="scss"></style>
