<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { uploadFile } from '@/utils/request'
  import { useTemplateRef } from 'vue'
  const editorStore = useEditorStore()
  const inputRef = useTemplateRef<HTMLInputElement>('input')

  async function checkUpload() {
    // 检查是否登录
    const res = await fetch(`${VITE_API_URL}/user/vertify`, {
      method: 'GET',
      credentials: 'include'
    })
    const resjson = await res.json()
    if (resjson.pass) {
      inputRef.value?.click()
      // alert('can upload file')
    } else {
      editorStore.setShowLoginBox(true)
    }
  }

  async function doUpload(payload: Event) {
    const input = payload.target as HTMLInputElement
    if (!input.files || input.files.length === 0) {
      return
    }
    const file = input.files[0]

    // 验证文件类型和大小
    // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    // if (!allowedTypes.includes(file.type)) {
    //   alert('不支持的文件类型')
    //   return
    // }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      alert('文件大小超过限制')
      return
    }
    try {
      // 开始上传
      // 模拟上传过程（实际项目中替换为真实的 API 调用）
      await uploadFile(file, file.name)

      // 上传成功
      // 清空文件输入
      if (inputRef.value) {
        inputRef.value.value = ''
      }
    } catch (error) {
      console.log(error)
      // 上传失败
      alert('上传失败')
    } finally {
      console.log('finally')
    }
  }
</script>

<template>
  <div class="uploadBox">
    <div class="block">
      <input ref="input" class="uploadIpt" type="file" @input="doUpload" />
      <button @click="checkUpload">upload</button>
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
      .uploadIpt {
        width: 0;
        height: 0;
      }
    }
  }
</style>
