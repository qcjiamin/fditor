<script lang="ts" setup>
  import layerList from './components/layer-list.vue'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'
</script>

<template>
  <div class="layerTab">
    <resource-header title="Layers"></resource-header>

    <div class="layers">
      <!-- 图层列表将在这里显示 -->
      <layer-list></layer-list>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .layerTab {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .layers {
      flex: 1;
      min-height: 300px; // 确保有足够的高度显示内容
      overflow-y: auto;
    }
  }
</style>
