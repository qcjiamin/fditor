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
    min-width: 32px;
    height: 32px;
    padding: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    background-color: #ffffff;
    border: 1px solid transparent;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &.showBorder {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &:hover {
      background-color: #f5f7fa;
      border-color: #e0e0e0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    &.active {
      background-color: #e6f0fa;
      border-color: #409eff;
      color: #409eff;
    }

    &.disable {
      pointer-events: none;
      opacity: 0.5;
      background-color: #f5f7fa;
    }
  }
</style>
