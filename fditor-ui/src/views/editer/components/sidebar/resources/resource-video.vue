<script lang="ts" setup>
  import { onMounted } from 'vue'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'

  onMounted(() => {})
</script>

<template>
  <div class="resourceVideoBox">
    <resource-header class="header" title="Video"></resource-header>
    <div class="content-block">
      <div class="placeholder-content">
        <div class="placeholder-icon">▶</div>
        <div class="placeholder-text">Video resources will appear here</div>
        <div class="placeholder-subtext">Add videos to your project</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resourceVideoBox {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb; // Light background similar to resource-menu.vue

    .content-block {
      flex: 1;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      .placeholder-content {
        text-align: center;
        color: #9ca3af; // Muted color

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: #d1d5db; // Light icon color
        }

        .placeholder-text {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #6b7280;
        }

        .placeholder-subtext {
          font-size: 14px;
          color: #9ca3af;
        }
      }
    }
  }
</style>
