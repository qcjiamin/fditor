<script lang="ts" setup>
  import { onBeforeUpdate } from 'vue'

  const props = defineProps<{
    text?: string
  }>()
  onBeforeUpdate(() => {
    console.log(props.text)
  })
</script>

<template>
  <div class="box">{{ text }}</div>
</template>

<style scoped lang="scss">
  .box {
    width: 100%;
    height: 68px;
  }
</style>
