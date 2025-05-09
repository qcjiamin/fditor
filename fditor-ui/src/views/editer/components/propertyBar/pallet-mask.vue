<script lang="ts" setup></script>

<template>
  <div class="pallet">
    <div class="mask">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .pallet {
    position: absolute;
    left: 0;
    top: 0;
    .mask {
      background: hsla(0, 0%, 100%, 0);
      position: fixed;
      inset: 0;
      user-select: none;
      z-index: 30;
    }
  }
</style>
