<script lang="ts" setup name="editer-sidebar">
  import resourceMenu from './menu/resource-menu.vue'
  // import resouceContent from './resouce-content.vue'
  import { computed, reactive, ref, watch, type Component, type CSSProperties } from 'vue'
  import { type ResourceName } from '@/utils/constants'
  import ResourceImage from './resources/resource-image.vue'
  import ResourceShape from './resources/resource-shape.vue'
  import ResourceVideo from './resources/resource-video.vue'
  import ResourceText from './resources/resource-text.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import type { TabName } from '@/views/editer/components/sidebar/types'
  import AnimationTab from '@/views/editer/components/sidebar/tabs/animation/animation-tab.vue'
  import FontsTab from '@/views/editer/components/sidebar/tabs/fonts/fonts-tab.vue'
  import ResourceUpload from '@/views/editer/components/sidebar/resources/resource-upload.vue'
  import ResourceLayer from '@/views/editer/components/sidebar/resources/resource-layer.vue'
  const resourceRef = ref<ResourceName>('image')
  const openRef = ref(false)
  // todo: 用泛型指明指定的组件？
  const resourceComponents: Record<ResourceName, Component> = {
    image: ResourceImage,
    shape: ResourceShape,
    video: ResourceVideo,
    text: ResourceText,
    upload: ResourceUpload,
    layer: ResourceLayer
  }

  const tabComponents: Partial<Record<TabName, Component>> = {
    animation: AnimationTab,
    fonts: FontsTab
  }

  function resourceChangeCallback(toResource: ResourceName) {
    openRef.value = true
    resourceRef.value = toResource
  }

  const editorStore = useEditorStore()
  const showProperty = computed(() => editorStore.sidebarShowTab !== 'resource')

  // 切换tab 和 切换选中元素时，清理属性页设置
  watch([() => editorStore.selected, resourceRef], () => {
    console.log('selectedchange clear setSidebarShowTab')
    editorStore.setSidebarShowTab('resource')
  })
  const positionStyle = reactive<CSSProperties>({
    position: 'static'
  })
  watch(openRef, () => {
    positionStyle.position = 'absolute'
  })
</script>

<template>
  <div class="editer-sidebar">
    <resource-menu @tab-change="resourceChangeCallback"></resource-menu>
    <div v-if="openRef" class="resouce-content">
      <!-- 对于 layer 组件不使用缓存，每次切换都重新渲染获取最新数据 -->
      <KeepAlive v-if="resourceRef !== 'layer'">
        <component :is="resourceComponents[resourceRef]"></component>
      </KeepAlive>
      <component :is="resourceComponents[resourceRef]" v-else></component>
    </div>
    <div v-if="showProperty" class="propertyTab" :style="positionStyle">
      <component :is="tabComponents[editorStore.sidebarShowTab]"></component>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .editer-sidebar {
    display: flex;
    height: 100%;
    position: relative;
    .resouce-content {
      width: 280px;
    }
    .propertyTab {
      // position: static;
      top: 0;
      width: 280px;
      height: 100%;
      // tab的宽度
      left: 69px;
      background-color: rgb(61, 48, 31);
    }
  }
</style>
