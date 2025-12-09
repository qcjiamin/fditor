<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  import type { MenuItem, MenuPosition } from './type'
  import { closeContextMenu } from './useContextMenu'
  import ContextMenuItem from './ContextMenuItem.vue'

  const props = defineProps<{
    items: MenuItem[]
    position: MenuPosition
    isSubmenu?: boolean
  }>()

  const menuRef = ref<HTMLElement | null>(null)
  const adjustedPosition = ref<MenuPosition>({ ...props.position })

  onMounted(() => {
    nextTick(() => {
      adjustPosition()
    })
  })

  function adjustPosition() {
    if (!menuRef.value) return
    
    const rect = menuRef.value.getBoundingClientRect()
    const { x, y } = props.position
    
    let newX = x
    let newY = y
    
    // 完整的边界检测
    // 右边界检测
    if (x + rect.width > window.innerWidth) {
      newX = props.isSubmenu 
        ? x - rect.width  // 子菜单显示在左侧
        : window.innerWidth - rect.width - 10
    }
    
    // 下边界检测
    if (y + rect.height > window.innerHeight) {
      newY = window.innerHeight - rect.height - 10
    }
    
    // 左边界检测
    if (newX < 0) newX = 10
    
    // 上边界检测
    if (newY < 0) newY = 10
    
    adjustedPosition.value = { x: newX, y: newY }
  }

  function handleItemClick(item: MenuItem) {
    if (item.disabled || item.submenu) return
    
    item.onSelect?.()
    closeContextMenu()
  }
</script>

<template>
  <div 
    ref="menuRef"
    class="context-menu-box"
    :style="{ 
      left: `${adjustedPosition.x}px`, 
      top: `${adjustedPosition.y}px` 
    }"
  >
    <ContextMenuItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      @click="handleItemClick(item)"
    />
  </div>
</template>

<style scoped>
  .context-menu-box {
    position: fixed;
    min-width: 180px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    z-index: 9999;
  }
</style>
