<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import colorPicker from '@/components/colorPicker/color-picker.vue'
  import type { konvaFill } from '../../../../../../core/types'
  // import colorBox from '@/components/colorBox/color-box.vue'
  // 引入透明背景图
  // ？为什么这种形式引入的url设置在背景上无效
  // import transparentIcon from '@/assets/transparent.svg?url'
  // 这种形式有效
  // const bgUrl = new URL('@/assets/transparent.svg', import.meta.url).href

  import transparentIcon from '@/assets/transparent.svg'
  const emit = defineEmits(['update:fill'])

  const props = defineProps<{
    fill: konvaFill
  }>()
  const transferFill = ref(props.fill as string)

  // 外部修改fill时，向下同步这个状态
  watch(
    () => props.fill,
    (newFill) => {
      transferFill.value = newFill as string
    }
  )

  watch(transferFill, (newFill) => {
    emit('update:fill', newFill)
  })
</script>

<template>
  <property-item show-border>
    <template #anchor>
      <div class="fillAnchor">
        <transparentIcon class="child"></transparentIcon>
        <div class="child" :style="{ backgroundColor: transferFill }"></div>
      </div>
    </template>
    <template #popup>
      <div class="pickerContainer">
        <color-picker v-model:color="transferFill"></color-picker>
        <!-- <color-box :color="transferFill"></color-box> -->
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
