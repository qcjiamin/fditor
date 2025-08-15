<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { inject, ref } from 'vue'
  import closeIcon from '@/assets/icons/normal/popup-close.svg'
  import { EditorKey } from '@/constants/injectKey'
  import { createProject } from '@/utils/workflow'
  import type { Editor } from '@fditor/core'
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor

  const username = ref('')
  const password = ref('')

  async function login() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })
    if (res.ok) {
      editorStore.setShowLoginBox(false)
      console.log('登录成功')
      await createProject(editor, editorStore)
    } else {
      alert('账号或密码错误')
    }
  }
  function closeLoginBox() {
    editorStore.setShowLoginBox(false)
  }
</script>

<template>
  <div class="loginBox">
    <div class="form">
      <div class="header">
        <div class="closeBtn" @click="closeLoginBox"><closeIcon /></div>
      </div>
      <div class="content">
        <el-input v-model="username" style="width: 240px" placeholder="Please input account" />
        <el-input
          v-model="password"
          style="width: 240px"
          type="password"
          placeholder="Please input password"
          show-password
        />
        <el-button @click="login">login</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loginBox {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #797976;
    // backdrop-filter: blur(10px);
    .form {
      background-color: white;
      border: 2px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .header {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        .closeBtn {
          padding: 5px;
          &:hover {
            background-color: rgba(64, 87, 109, 0.07);
          }
        }
      }
      .content {
        margin: 0 10px 10px 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
    }
  }
</style>
