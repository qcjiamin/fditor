<script lang="ts" setup>
  import layerList from './components/layer-list.vue'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'
</script>

<template>
  <div class="resource-container">
    <resource-header title="Layers"></resource-header>
    <div class="content-block">
      <!-- 图层列表将在这里显示 -->
      <layer-list></layer-list>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/resourceContentBox.scss' as *;
  @include resource-content-box;
</style>
