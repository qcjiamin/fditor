<script lang="ts" setup>
  import { onMounted } from 'vue'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'
  import { FVideo } from '@fditor/core'
  import { useAddAndDeleteElement } from '@/stores/commands/useAddAndRemoveElement'
  const { addElement } = useAddAndDeleteElement()
  onMounted(() => {})

  async function addVideo() {
    const video = await FVideo.fromUrl('https://remotion.media/BigBuckBunny.mp4', {})
    await addElement(video)
  }
</script>

<template>
  <div class="resource-container">
    <resource-header class="header" title="Video"></resource-header>
    <div class="content-block">
      <button @click="addVideo">测试视频</button>
      <div class="placeholder-content">
        <div class="placeholder-icon">▶</div>
        <div class="placeholder-text">Video resources will appear here</div>
        <div class="placeholder-subtext">Add videos to your project</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/resourceContentBox.scss' as *;
  @include resource-content-box;

  .content-block {
    flex: 1;
    padding: 8px;
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
</style>
