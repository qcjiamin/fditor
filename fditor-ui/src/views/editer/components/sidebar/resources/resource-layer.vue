<script lang="ts" setup>
  import layerList from './components/layer-list.vue'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'
</script>

<template>
  <div class="resourceLayerBox">
    <resource-header title="Layers"></resource-header>
    <div class="content-block">
      <!-- 图层列表将在这里显示 -->
      <layer-list></layer-list>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resourceLayerBox {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb; // Light background similar to resource-menu.vue

    .content-block {
      flex: 1;
      padding: 8px; // Add padding to create breathing space
      overflow-y: auto; // Ensure scrollability
    }
  }
</style>
