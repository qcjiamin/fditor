<script lang="ts" setup>
  defineProps<{
    text?: string
    selected: boolean
  }>()
</script>

<template>
  <div class="box" :class="[{ selected: selected }]">{{ text }}</div>
</template>

<style scoped lang="scss">
  .box {
    user-select: none;
    width: 100%;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: rgba(170, 165, 165, 0.4);
    }
    &.selected {
      background-color: rgb(170, 165, 165);
    }
  }
</style>
