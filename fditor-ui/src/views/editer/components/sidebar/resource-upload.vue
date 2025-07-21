<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  const editorStore = useEditorStore()

  type VertifyResponse = {
    success: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } & Record<string, any>

  async function upload() {
    // 检查是否登录
    const res = await fetch(`${VITE_API_URL}/user/vertify`, {
      method: 'GET',
      credentials: 'include'
    })
    const resjson = (await res.json()) as VertifyResponse
    if (resjson.success) {
      alert('can upload file')
    } else {
      editorStore.setShowLoginBox(true)
    }
  }
</script>

<template>
  <div class="uploadBox">
    <div class="block">
      <button @click="upload">upload</button>
    </div>
    <div class="block"> </div>
  </div>
</template>

<style scoped lang="scss">
  .uploadBox {
    // padding-top: 8px;
    padding: 8px 0 16px 16px;
    width: 100%;
    background-color: $TAB_BGCOLOR;
    height: 100%;
    display: flex;
    flex-direction: column;
    .block {
      width: 100%;
      margin-bottom: 1rem;
      .title {
        color: $TAB_TITLE_COLOR;
        font-size: $TAB_TITLE_FONTSIZE;
        margin-bottom: 7px;
      }
      .content {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        .box {
          color: white;
          width: 70px;
          height: 70px;
          border-radius: 5px;
          background-color: rgb(117, 113, 113);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          &:hover {
            background-color: rgb(65, 64, 64);
            cursor: default;
          }
        }
      }
    }
  }
</style>
