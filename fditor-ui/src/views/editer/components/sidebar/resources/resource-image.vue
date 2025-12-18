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
  <div class="resourceImageBox">
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
  .resourceImageBox {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb; // Light background similar to resource-menu.vue

    .content-block {
      width: 100%;
      flex: 1;
      padding: 8px; // Add padding to create breathing space
      overflow-y: auto; // Ensure scrollability

      :deep(.water-flow) {
        .water-item {
          margin-bottom: 8px; // Space between items
          border-radius: 6px; // Softer corners
          overflow: hidden; // Ensure images stay within rounded corners
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow

          &:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); // Figma-style hover effect
          }
        }
      }

      .image-item {
        width: 100%;
        height: 100%;
        cursor: pointer;

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
    }
  }
</style>
