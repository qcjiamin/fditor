<script lang="ts" setup>
  import { inject, onBeforeUpdate, onMounted } from 'vue'
  import axios from 'axios'
  import WaterFlow from '@/components/water-flow.vue'
  import type { ImageInfo } from '@/types'
  import { EditorKey } from '@/constants/injectKey'
  import { loadImage } from '@/utils/common'
  import { FImage, type Editor } from '@kditor/core'

  const editor = inject(EditorKey) as Editor
  onMounted(async () => {})
  onBeforeUpdate(() => {
    // 计算图片的宽度
  })
  async function requestImages(page: number, pageSize: number) {
    const res = await axios.get(`/search/photos?page=${page}&pageSize=${pageSize}`)
    console.log(res)
    const newImages: ImageInfo[] = res.data.results.map(
      (item: { small: string; width: number; height: number; title: string }) => {
        return { src: item.small, title: item.title, width: item.width, height: item.height }
      }
    )
    newImages.unshift({
      src: './images/1.png',
      title: 'test',
      width: 2160,
      height: 3840
    })
    return {
      totalPage: res.data.total_pages,
      images: newImages
    }
  }
  async function addImage(src: string) {
    console.log(src)
    const imgEl = await loadImage(src)

    const image = new FImage(imgEl)

    // const image = new FImage(imgEl)

    // const image = new FabricImage(imgEl, {})
    image.scaleToWidth(300)
    editor.add(image)
  }
</script>

<template>
  <div class="resouceImageBox">
    <div class="block">
      <!-- 增加搜索功能 -->
      <water-flow :request-fun="requestImages" :page-size="30">
        <template #item="{ imgInfo }">
          <img :src="imgInfo.src" alt="" loading="lazy" @click="addImage(imgInfo.src)" />
        </template>
      </water-flow>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resouceImageBox {
    padding: 8px 8px 16px 16px;
    width: 100%;
    background-color: $TAB_BGCOLOR;
    height: 100%;
    display: flex;
    flex-direction: column;
    .block {
      width: 100%;
      height: 100%;
      // overflow: auto;
      // column-count: 2; // 列数
      // column-gap: 5px;
      // row-gap: 5px;
      // water-flow {
      img {
        width: 100%;
      }
      // }
    }
  }
</style>
