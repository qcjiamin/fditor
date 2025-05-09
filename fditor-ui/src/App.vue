<script setup lang="ts">
  import '@/styles/reset.scss'
  import viewEditer from './views/editer/view-editer.vue'
  // import { onMounted } from 'vue'
  // import Editer from 'packages/core/Editer'

  // onMounted(() => {
  //   const editer = new Editer()
  // })
</script>

<template>
  <view-editer />
</template>

<style scoped lang="scss">
  * {
    font-family: $GLOBAL_FONTFAMILY;
  }
</style>
