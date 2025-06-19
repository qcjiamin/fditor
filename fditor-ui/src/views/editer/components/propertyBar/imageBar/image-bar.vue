<!-- todo: 翻转 滤镜 圆角 layer-->
<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import type { Editor } from '@fditor/core'
  import { inject } from 'vue'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { Crop } from '@element-plus/icons-vue'
  import flipProperty from '@/views/editer/components/propertyBar/imageBar/flip-property.vue'

  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  // const selected = editorStore.selected as FImage
  function addClippath() {
    editorStore.setCvsState('clip')
    editor.doClip()
  }
</script>

<template>
  <div class="typeBar">
    <property-normal-item tip="crop" @click="addClippath">
      <el-icon size="20">
        <Crop></Crop>
      </el-icon>
    </property-normal-item>
    <flip-property></flip-property>
  </div>
</template>

<style scoped lang="scss"></style>
