<script lang="ts" setup></script>

<template>
  <div class="bar">
    <div class="timestamp">00:00:00:00 | 00:00:00:00</div>
    <div class="play">play</div>
    <div class="layout">layout</div>
  </div>
</template>

<style scoped lang="scss">
  .bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    .play {
      position: absolute;
      transform: translateX(-50%);
      left: 50%;
    }
  }
</style>
