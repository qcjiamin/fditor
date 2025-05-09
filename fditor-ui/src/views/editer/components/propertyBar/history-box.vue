<script lang="ts" setup></script>

<template>
  <div class="historyBox">
    <button class="undoBtn">U</button>
    <button class="redoBtn">R</button>
  </div>
</template>

<style scoped lang="scss">
  .historyBox {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    // justify-content: center;
    align-items: center;
    column-gap: 5px;
    .colorBtn {
      width: 30px;
      height: 30px;
      background-color: aqua;
    }
  }
</style>
