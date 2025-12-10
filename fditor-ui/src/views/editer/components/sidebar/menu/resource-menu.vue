<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import menuItem from './menu-item.vue'
  import { resourceNames, type ResourceName } from '@/utils/constants'
  const emit = defineEmits(['tabChange'])
  const editorStore = useEditorStore()
  defineProps<{
    resourceType: ResourceName
  }>()

  function selectResource(tabName: ResourceName) {
    emit('tabChange', tabName)
  }
</script>

<template>
  <div class="menu-box">
    <menu-item
      v-for="item of resourceNames"
      :key="item"
      :text="item"
      :selected="editorStore.openSidebar && resourceType === item"
      @click="selectResource(item)"
    ></menu-item>
  </div>
</template>

<style scoped lang="scss">
  .menu-box {
    width: 69px;
    height: 100%;
    background-color: bisque;
  }
</style>
