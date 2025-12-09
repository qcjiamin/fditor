<script setup lang="ts">
  import { computed } from 'vue'
  import { useContextMenuState, closeContextMenu } from './useContextMenu'
  import ContextMenuBox from './ContextMenuBox.vue'

  const menuState = useContextMenuState()

  const visible = computed(() => menuState.visible)
  const position = computed(() => menuState.position)
  const items = computed(() => menuState.items)

  function handleClickOutside(e: MouseEvent) {
    // 只处理左键和右键点击
    if (e.button !== 0 && e.button !== 2) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    closeContextMenu()
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="context-menu-mask" @mousedown="handleClickOutside"></div>
    <ContextMenuBox 
      v-if="visible"
      :items="items" 
      :position="position"
    />
  </Teleport>
</template>

<style scoped>
  .context-menu-mask {
    position: fixed;
    inset: 0;
    z-index: 9998;
  }
</style>
