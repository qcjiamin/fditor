<script setup lang="ts">
  import '@/styles/reset.scss'
  import '@/styles/global.scss'
  import viewEditer from './views/editer/view-editer.vue'
  // import { FCanvas } from '@fditor/core'
  import { onMounted, ref } from 'vue'
  // import { onMounted } from 'vue'
  // import Editer from 'packages/core/Editer'

  const preload = ref(true)
  // 处理一些需要提前加载的资源
  onMounted(async () => {
    // await FCanvas.setPredefineControls()
    preload.value = false
  })
</script>

<template>
  <div v-if="preload">inloading</div>
  <view-editer v-else />
</template>

<style scoped lang="scss"></style>
