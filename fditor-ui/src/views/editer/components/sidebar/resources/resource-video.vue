<script lang="ts" setup>
  import { onMounted } from 'vue'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'

  onMounted(() => {})
</script>

<template>
  <div class="resouceVideoeBox">
    <resource-header class="header" title="Image"></resource-header>
  </div>
</template>

<style scoped lang="scss">
  .resouceVideoeBox {
    width: 100%;
    background-color: rgb(79, 87, 100);
    height: 100%;
  }
</style>
