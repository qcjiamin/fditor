<script lang="ts" setup name="editer-sidebar">
  import resourceMenu from './resource-menu.vue'
  // import resouceContent from './resouce-content.vue'
  import { ref, type Component } from 'vue'
  import { type TabName } from '../../../../utils/constants'
  import ResourceImage from './resource-image.vue'
  import ResourceShape from './resource-shape.vue'
  import ResourceVideo from './resource-video.vue'
  import ResourceText from './resource-text.vue'
  const tabRef = ref<TabName>('image')
  const openRef = ref(false)
  // todo: 用泛型指明指定的组件？
  const resourceComponents: Record<TabName, Component> = {
    image: ResourceImage,
    shape: ResourceShape,
    video: ResourceVideo,
    text: ResourceText
  }
  function tabChangeCallback(toTab: TabName) {
    openRef.value = true
    tabRef.value = toTab
  }
</script>

<template>
  <div class="editer-sidebar">
    <resource-menu @tab-change="tabChangeCallback"></resource-menu>
    <div v-if="openRef" class="resouce-content">
      <KeepAlive>
        <component :is="resourceComponents[tabRef]"></component>
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .editer-sidebar {
    display: flex;
    height: 100%;
    .resouce-content {
      width: 280px;
    }
  }
</style>
