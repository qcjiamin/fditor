<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { uploadFile } from '@/utils/request'
  import { useTemplateRef } from 'vue'
  const editorStore = useEditorStore()
  const inputRef = useTemplateRef<HTMLInputElement>('input')

  async function checkUpload() {
    // 检查是否登录
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/vertify`, {
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
  <div class="resourceUploadBox">
    <div class="content-block">
      <div class="upload-area" @click="checkUpload">
        <div class="upload-icon">📁</div>
        <div class="upload-text">Click to upload</div>
        <div class="upload-subtext">or drag and drop files here</div>
        <input ref="input" class="uploadIpt" type="file" @input="doUpload" />
      </div>
      <div class="recent-uploads-section">
        <div class="section-title">Recent Uploads</div>
        <div class="recent-uploads-placeholder">
          No recent uploads
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resourceUploadBox {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb; // Light background similar to resource-menu.vue

    .content-block {
      width: 100%;
      flex: 1;
      padding: 8px; // Add padding to create breathing space
      display: flex;
      flex-direction: column;
      gap: 16px; // Space between sections
      overflow-y: auto; // Ensure scrollability

      .upload-area {
        border: 2px dashed #d1d5db; // Dashed border for upload area
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #9ca3af; // Darker border on hover
          background-color: #f3f4f6; // Light background on hover
        }

        .upload-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .upload-text {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .upload-subtext {
          font-size: 14px;
          color: #6b7280;
        }

        .uploadIpt {
          display: none; // Hide the input but still allow interaction
        }
      }

      .recent-uploads-section {
        .section-title {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280; // Muted title color
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .recent-uploads-placeholder {
          width: 100%;
          min-height: 80px;
          border-radius: 6px;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af; // Muted text color
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow

          &:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        }
      }
    }
  }
</style>
