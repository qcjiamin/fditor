<script lang="ts" setup>
  const {
    tip = '',
    showBorder = false,
    active = false,
    disable = false,
    inloading = false
  } = defineProps<{
    tip?: string
    showBorder?: boolean
    active?: boolean
    disable?: boolean
    inloading?: boolean
  }>()
  const emit = defineEmits(['click'])
  function clickHandle() {
    emit('click')
  }
</script>

<template>
  <div>
    <el-tooltip :content="tip" :disabled="tip === ''">
      <div ref="anchor" class="anchorBox" :class="{ active, disable, showBorder: showBorder }" @click="clickHandle">
        <slot v-if="!inloading"></slot>
        <span v-else>inloading...</span>
      </div>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/_text.scss' as *;
  .anchorBox {
    @include ellipsis;
    font-size: 14px; // Slightly smaller, more refined font
    width: 120px;
    text-align: left;
    height: 36px; // Match new height standard
    line-height: 36px; // Match new height standard
    padding-left: 8px; // Match new padding standard
    padding-right: 8px; // Match new padding standard
    border-radius: 4px; // Match new design system
    transition: background-color 0.2s ease; // Smooth transitions for better UX

    &.showBorder {
      box-sizing: border-box;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08); // Subtle border instead of grey outline
    }

    &:hover {
      background-color: rgba(64, 87, 109, 0.08); // Match new hover color
    }

    &.active {
      background-color: rgba(57, 76, 96, 0.16); // Match new active color
      font-weight: 500; // Add slight weight to indicate active state
    }

    &.disable {
      pointer-events: none;
      opacity: 0.5; // Use opacity instead of color change for disabled state
    }
  }
</style>
