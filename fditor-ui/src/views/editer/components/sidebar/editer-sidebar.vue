<script lang="ts" setup name="editer-sidebar">
  import resourceMenu from './resource-menu.vue'
  // import resouceContent from './resouce-content.vue'
  import { computed, reactive, ref, watch, type Component, type CSSProperties } from 'vue'
  import { type TabName } from '@/utils/constants'
  import ResourceImage from './resource-image.vue'
  import ResourceShape from './resource-shape.vue'
  import ResourceVideo from './resource-video.vue'
  import ResourceText from './resource-text.vue'
  import { useEditorStore } from '@/stores/editorStore'
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

  const editorStore = useEditorStore()
  const showProperty = computed(() => editorStore.sidebarShowProperty !== '')

  // 切换tab 和 切换选中元素时，清理属性页设置
  watch([() => editorStore.selected, tabRef], () => {
    console.log('selectedchange clear sidebarProperty')
    editorStore.setSidebarShowProperty('')
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
    <resource-menu @tab-change="tabChangeCallback"></resource-menu>
    <div v-if="openRef" class="resouce-content">
      <KeepAlive>
        <component :is="resourceComponents[tabRef]"></component>
      </KeepAlive>
    </div>
    <div v-if="showProperty" class="propertyTab" :style="positionStyle">animate</div>
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
