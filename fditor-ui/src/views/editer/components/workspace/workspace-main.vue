<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  // import workspaceBar from './workspace-bar.vue'
  const containerRef = ref<HTMLDivElement | null>(null)
  defineExpose({
    //!暴露响应式属性，不输出.value
    containerRef: containerRef
  })
  onMounted(() => {
    console.log('main')
    console.log(containerRef.value)
  })
</script>

<template>
  <div class="workspace-main">
    <div class="pageContainer">
      <div id="canvas-container" ref="containerRef">
        <canvas></canvas>
      </div>
    </div>
    <!-- <workspace-bar></workspace-bar> -->
  </div>
</template>

<style scoped lang="scss">
  .workspace-main {
    display: flex;
    flex-direction: column;
    .pageContainer {
      background-color: #e8e8ea;
      position: relative;
      flex-grow: 1;
      #canvas-container {
        position: absolute;
        // background-color: rgb(68, 66, 62);
        // flex-grow: 1;
        // display: flex;
        // align-items: center;
        // justify-content: center;
      }
    }
  }
</style>
