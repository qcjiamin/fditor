<!-- 有图片宽高信息的瀑布流实现 -->
<!-- 以图片高度为基础 -->
<!-- todo: 
 传入columns
 -->
<script setup lang="ts">
  // import axios from 'axios'
  import { computed, onMounted, reactive, ref } from 'vue'
  import type { ImageInfo } from '@/types'

  interface ImagePos {
    x: number
    y: number
  }

  interface Props {
    requestFun: (page: number, pageSize: number) => Promise<{ totalPage: number; images: ImageInfo[] }>
    pageSize?: number
    rowGap?: number
    columnGap?: number
    // columns: number
  }
  const { requestFun, pageSize = 30, rowGap = 8, columnGap = 15 } = defineProps<Props>()
  // defineSlots<{
  //   item(props: { imgInfo: ImageInfo }): any
  // }>()

  // 准备数据源
  const state = reactive({
    inLoading: false, // 是否在加载
    page: 1, // 当前加载页
    columns: 2, // 渲染列数
    columnsHeight: [] as number[], // 每一列当前高度
    columnsNumber: [] as number[], // 每一列当前子元素数量
    images: [] as ImageInfo[], // 图片
    imgW: 200, // 列宽
    ImagesPos: [] as ImagePos[], // 定位信息
    totalPage: -1 // 总页数
  })
  // 加载完所有页
  const loadAll = computed(() => {
    return state.totalPage === state.page - 1
  })

  const containerRef = ref<HTMLDivElement>()
  const listRef = ref<HTMLDivElement>()
  const loadboxRef = ref<HTMLDivElement>()
  async function loadImages(isFirst: boolean = false) {
    state.inLoading = true
    const { totalPage, images } = await requestFun(state.page, pageSize)
    state.totalPage = totalPage

    resetPosition(images, isFirst)

    state.images.push(...images)
    state.page = state.page + 1
    state.inLoading = false
  }
  function resetPosition(list: ImageInfo[], isFirst: boolean = false) {
    let top = 0
    let left = 0
    let idx = 0
    for (let i = 0; i < list!.length; i++) {
      if (isFirst && i < state.columns) {
        top = 0
        idx = i
        left = i * state.imgW + idx * columnGap
      } else {
        top = Math.min(...state.columnsHeight)
        idx = state.columnsHeight.findIndex((val) => val === top)
        left = idx * state.imgW + idx * columnGap
      }
      state.columnsNumber[idx]++
      const sumRowGap = isFirst && i < state.columns ? 0 : rowGap
      state.ImagesPos.push({
        x: left,
        y: top + sumRowGap
      })
      const showHeight = state.imgW / (list[i].width / list[i].height)
      state.columnsHeight[idx] = state.columnsHeight[idx] + showHeight + sumRowGap
    }
    listRef.value!.style.height = Math.max(...state.columnsHeight) + 'px'
  }

  onMounted(async () => {
    const observer = new ResizeObserver(function (entries) {
      // 绑定时会立即执行
      const rect = entries[0].contentRect
      if (rect.width > 1200) {
        state.columns = 4
      } else if (rect.width > 900) {
        state.columns = 3
      } else if (rect.width > 600) {
        state.columns = 2
      }
      state.imgW = (containerRef.value!.clientWidth - columnGap * (state.columns - 1)) / state.columns
      state.ImagesPos = []
      state.columnsHeight = new Array(state.columns).fill(0)
      state.columnsNumber = new Array(state.columns).fill(0)
      resetPosition(state.images, true)
    })
    observer.observe(containerRef.value!)

    const loadObserver = new IntersectionObserver(function (entries) {
      if (entries[0].intersectionRatio <= 0) return
      if (state.inLoading) return
      console.log('IntersectionObserver')
      setTimeout(async () => {
        await loadImages(false)
      }, 500)
    })
    loadObserver.observe(loadboxRef.value!)
  })
</script>
<template>
  <div ref="containerRef" class="container">
    <div ref="listRef" class="list">
      <div
        v-for="(img, index) in state.images"
        :key="img.title"
        class="item"
        :style="{
          width: state.imgW + 'px',
          // 保证容器范围先显示准确的定位
          aspectRatio: img.width / img.height,
          // height: state.imgW / (img.width / img.height) + 'px',
          transform: `translate3d(${state.ImagesPos[index].x}px, ${state.ImagesPos[index].y}px, 0)`
        }"
      >
        <!-- 具名插槽，向外传递属性 -->
        <slot name="item" :img-info="img"></slot>
      </div>
    </div>
    <div v-if="!loadAll" ref="loadboxRef" class="loadBox"></div>
  </div>
</template>

<style scoped lang="scss">
  .container {
    // --itemWidth: 200px;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    .list {
      width: 100%;
      position: relative;
      .item {
        box-sizing: border-box;
        // border: 1px solid green;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
    .loadBox {
      height: 100px;
      width: 100%;
      background-color: aquamarine;
    }
  }
</style>
