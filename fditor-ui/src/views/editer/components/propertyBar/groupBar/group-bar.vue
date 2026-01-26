<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { inject } from 'vue'
  import { type Editor } from '@fditor/core'
  // import { useEditorStore } from '@/stores/editorStore'
  import type { Group } from 'fabric'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  // 从 public 目录导入 SVG
  import unGroupIcon from '@/assets/icons/groupbar/ungroup.svg'
  import { useGroup } from '@/stores/commands/useGroup'
  // const props = defineProps<{
  //   foo?: string
  // }>()
  // 每次修改都重新选中当前元素，触发onMounted 获取属性
  // or 修改属性后通知当前组件直接更新
  const editor = inject(EditorKey) as Editor
  // const editorStore = useEditorStore()

  const { executeUnGroup } = useGroup()
  function unGroup() {
    executeUnGroup(editor.getActiveObject() as Group)
  }
</script>

<template>
  <div class="typeBar">
    <property-normal-item tip="unGroup" @click="unGroup">
      <el-icon size="20">
        <unGroupIcon class="figma-icon"></unGroupIcon>
      </el-icon>
    </property-normal-item>
  </div>
</template>

<style scoped lang="scss">
  .typeBar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
