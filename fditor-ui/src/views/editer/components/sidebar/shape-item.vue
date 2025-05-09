<script lang="ts" setup>
  import { computed } from 'vue'

  const props = defineProps<{
    name: string
    url: string
  }>()
  // 计算属性动态设置 `style`
  const bgStyle = computed(() => ({
    backgroundImage: `url(${props.url})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center'
  }))
</script>

<template>
  <div class="box">
    <div class="shape-preview">
      <div class="inner" :style="bgStyle"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .box {
    color: white;
    width: 70px;
    height: 70px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    &:hover {
      background-color: rgba(19, 19, 27, 0.1);
      cursor: default;
    }
    .shape-preview {
      width: 100%;
      height: 100%;
      padding: 7px;
    }
    .inner {
      width: 100%;
      height: 100%;
    }
  }
</style>
