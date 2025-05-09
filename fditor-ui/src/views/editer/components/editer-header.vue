<script lang="ts" setup></script>

<template>
  <div class="header">
    <div class="header-left">
      <div class="name">xxx</div>
    </div>
    <div class="header-right">
      <div class="preview">预览</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .header {
    height: $EDITER_HEADER_HEIGHT;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: aquamarine;
    .header-left {
      margin-left: 10px;
    }
    .header-right {
      margin-right: 10px;
    }
  }
</style>
