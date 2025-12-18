<script lang="ts" setup>
  import { inject, onBeforeUpdate, onMounted } from 'vue'
  import axios from 'axios'
  import WaterFlow from '@/components/water-flow.vue'
  import type { ImageInfo } from '@/types'
  import { EditorKey } from '@/constants/injectKey'
  import { loadImage } from '@/utils/common'
  import { FImage, type Editor } from '@fditor/core'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'

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
  <div class="resource-container">
    <resource-header class="header" title="Image"></resource-header>
    <div class="content-block">
      <!-- 增加搜索功能 -->
      <water-flow :request-fun="requestImages" :page-size="30">
        <template #item="{ imgInfo }">
          <div class="image-item">
            <img :src="imgInfo.src" alt="" loading="lazy" @click="addImage(imgInfo.src)" />
          </div>
        </template>
      </water-flow>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/resourceContentBox.scss' as *;
  @include resource-content-box;

  .image-item {
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover; // Ensure images maintain aspect ratio
      display: block;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9; // Subtle hover effect
      }
    }
  }
</style>
