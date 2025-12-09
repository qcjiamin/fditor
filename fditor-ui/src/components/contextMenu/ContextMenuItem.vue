<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { MenuItem, MenuPosition } from './type'
  import ContextMenuBox from './ContextMenuBox.vue'

  const props = defineProps<{
    item: MenuItem
  }>()

  const emit = defineEmits<{
    click: [MenuItem]
  }>()

  const itemRef = ref<HTMLElement | null>(null)
  const showSubmenu = ref(false)
  const submenuPosition = ref<MenuPosition>({ x: 0, y: 0 })

  const hasSubmenu = computed(() => props.item.submenu && props.item.submenu.length > 0)

  function handleClick() {
    if (props.item.disabled || props.item.divider) return
    if (hasSubmenu.value) return

    emit('click', props.item)
  }

  function handleMouseEnter() {
    if (!hasSubmenu.value || !itemRef.value) return

    const rect = itemRef.value.getBoundingClientRect()
    submenuPosition.value = {
      x: rect.right,
      y: rect.top
    }
    showSubmenu.value = true
  }

  function handleMouseLeave() {
    showSubmenu.value = false
  }
</script>

<template>
  <!-- 分隔线 -->
  <div v-if="item.divider" class="context-menu-divider"></div>

  <!-- 普通菜单项 -->
  <div
    v-else
    ref="itemRef"
    :class="[
      'context-menu-item',
      {
        'has-submenu': hasSubmenu,
        disabled: item.disabled
      }
    ]"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- <span v-if="item.icon" class="item-icon"></span> -->
    <img v-if="item.icon" :src="item.icon" class="item-icon" alt="" />
    <span class="item-label">{{ item.label }}</span>
    <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
    <span v-if="hasSubmenu" class="item-arrow">▶</span>

    <ContextMenuBox
      v-if="showSubmenu && hasSubmenu"
      :items="item.submenu!"
      :position="submenuPosition"
      :is-submenu="true"
    />
  </div>
</template>

<style scoped>
  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    position: relative;
  }

  .context-menu-item:hover:not(.disabled) {
    background-color: #f5f5f5;
  }

  .context-menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .context-menu-divider {
    border-top: 1px solid #e0e0e0;
    margin: 4px 0;
    height: 1px;
  }

  .item-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-label {
    flex: 1;
    font-size: 14px;
  }

  .item-shortcut {
    font-size: 12px;
    color: #999;
  }

  .item-arrow {
    font-size: 10px;
    color: #999;
  }
</style>
