<script lang="ts" setup>
  const {
    tip = '',
    showBorder = false,
    active = false,
    disable = false
  } = defineProps<{
    tip?: string
    showBorder?: boolean
    active?: boolean
    disable?: boolean
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
        <slot></slot>
      </div>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
  .anchorBox {
    min-width: 36px;
    height: 36px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px; // Softer rounded corners following Figma's design
    transition: background-color 0.2s ease; // Smooth transitions for better UX

    &.showBorder {
      box-sizing: border-box;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08); // Subtle border instead of grey outline
    }

    &:hover {
      background-color: rgba(64, 87, 109, 0.08); // Slightly more pronounced hover effect
    }

    &.active {
      background-color: rgba(57, 76, 96, 0.16); // Slightly more pronounced active state
      font-weight: 500; // Add slight weight to indicate active state
    }

    &.disable {
      pointer-events: none;
      opacity: 0.5; // Use opacity instead of color change for disabled state
    }
  }
</style>
