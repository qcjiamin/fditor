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
  <div class="shape-item">
    <div class="shape-preview">
      <div class="inner" :style="bgStyle"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .shape-item {
    width: calc(50% - 4px); // Two columns with proper spacing
    min-height: 70px;
    border-radius: 6px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow
    border: 1px solid #e5e7eb; // Subtle border

    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); // Figma-style hover effect
      border-color: #d1d5db; // Slightly more prominent border on hover
      transform: translateY(-1px); // Subtle lift effect
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
