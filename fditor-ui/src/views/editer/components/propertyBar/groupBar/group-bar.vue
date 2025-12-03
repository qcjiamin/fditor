<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { inject } from 'vue'
  import { type Editor } from '@fditor/core'
  // import { useEditorStore } from '@/stores/editorStore'
  import type { Group } from 'fabric'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { Delete } from '@element-plus/icons-vue'
  // const props = defineProps<{
  //   foo?: string
  // }>()
  // 每次修改都重新选中当前元素，触发onMounted 获取属性
  // or 修改属性后通知当前组件直接更新
  const editor = inject(EditorKey) as Editor
  // const editorStore = useEditorStore()

  function unGroup() {
    ;(editor.getActiveObject() as Group).toActiveSelection()
    editor.render()
  }
</script>

<template>
  <div class="typeBar">
    <property-normal-item tip="unGroup" @click="unGroup">
      <el-icon size="20">
        <Delete></Delete>
      </el-icon>
    </property-normal-item>
  </div>
</template>

<style scoped lang="scss"></style>
