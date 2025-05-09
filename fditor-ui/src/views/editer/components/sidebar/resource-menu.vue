<script lang="ts" setup>
  import menuItem from './menu-item.vue'
  import { tabNames, type TabName } from '@/utils/constants'
  const emit = defineEmits(['tabChange'])

  function selectResource(tabName: TabName) {
    emit('tabChange', tabName)
  }
</script>

<template>
  <div class="menu-box">
    <menu-item v-for="item of tabNames" :key="item" :text="item" @click="selectResource(item)"></menu-item>
  </div>
</template>

<style scoped lang="scss">
  .menu-box {
    width: 69px;
    height: 100%;
    background-color: bisque;
  }
</style>
