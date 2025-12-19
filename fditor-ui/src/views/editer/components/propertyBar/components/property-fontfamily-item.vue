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
    font-size: 13px;
    width: 120px;
    text-align: left;
    height: 32px;
    line-height: 32px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 6px;
    transition: all 0.2s ease;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &.showBorder {
      box-sizing: border-box;
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &:hover {
      border-color: #d0d0d0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    &.active {
      background-color: #e6f0fa;
      border-color: #409eff;
      color: #409eff;
      font-weight: 500;
    }

    &.disable {
      pointer-events: none;
      opacity: 0.5;
      background-color: #f5f7fa;
    }
  }
</style>
