<!-- confirmClip 在裁剪框失焦时会以事件（confirm:clip）的形式通知外部 -->
<script lang="ts" setup>
  import { inject } from 'vue'
  import type { Editor } from '@fditor/core'
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { Check } from '@element-plus/icons-vue'
  import { Close } from '@element-plus/icons-vue'

  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  async function confirmClip() {
    await editor.confirmClip()
    editorStore.setCvsState('normal')
  }
  async function cancelClip() {
    await editor.cancelClip()
    editorStore.setCvsState('normal')
  }
</script>

<template>
  <div class="figmaClipBar">
    <property-normal-item tip="confirm" @click="confirmClip">
      <el-icon size="20">
        <Check class="figma-icon"></Check>
      </el-icon>
    </property-normal-item>
    <property-normal-item tip="cancel" @click="cancelClip">
      <el-icon size="20">
        <Close class="figma-icon"></Close>
      </el-icon>
    </property-normal-item>
    <!-- <button @click="confirmClip">confirm</button>
    <button @click="cancelClip">cancel</button> -->
  </div>
</template>

<style scoped lang="scss">
  .figmaClipBar {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
