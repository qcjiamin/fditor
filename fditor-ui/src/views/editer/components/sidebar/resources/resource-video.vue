<script lang="ts" setup>
  // import { ref } from 'vue'
  import colorPicker from '@/components/colorPicker/color-picker.vue'
  import { onMounted, ref, watch } from 'vue'
  const colorRef = ref('rgba(255, 255, 255, 1)')
  // function updateColor(color: string) {
  //   console.log('updateColor', color)
  //   colorRef.value = color
  // }
  watch(colorRef, (color) => {
    console.log('updateColor', color)
    // const div = document.querySelector('.resouceVideoeBox') as HTMLDivElement
    // div.style.backgroundColor = colorRef.value
  })
  onMounted(() => {
    // 获取颜色时，默认将其类型转换为rgb来处理
  })
</script>

<template>
  <div class="resouceVideoeBox">
    <color-picker v-model:color="colorRef"></color-picker>
  </div>
</template>

<style scoped lang="scss">
  .resouceVideoeBox {
    width: 100%;
    background-color: rgb(79, 87, 100);
    height: 100%;
  }
</style>
