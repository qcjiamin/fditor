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
    font-size: 15px;
    width: 120px;
    text-align: left;
    height: 30px;
    line-height: 30px;
    padding-left: 5px;
    padding-right: 5px;
    &.showBorder {
      box-sizing: border-box;
      box-shadow: grey 0px 0px 2px;
      border-radius: 2px;
    }
    &:hover {
      background-color: rgba(64, 87, 109, 0.07);
    }
    &.active {
      background-color: rgba(57, 76, 96, 0.15);
    }
    &.disable {
      pointer-events: none;
      color: gray;
    }
  }
</style>
