<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { inject } from 'vue'
  import { type Editor } from '@fditor/core'
  // import { useEditorStore } from '@/stores/editorStore'
  import type { ActiveSelection } from 'fabric'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  // import groupIcon from '/images/group.svg'
  import groupIcon from '@/assets/icons/groupbar/group.svg'
  // const props = defineProps<{
  //   foo?: string
  // }>()
  // 每次修改都重新选中当前元素，触发onMounted 获取属性
  // or 修改属性后通知当前组件直接更新
  const editor = inject(EditorKey) as Editor

  function doGroup() {
    ;(editor.getActiveObject() as ActiveSelection).toGroup()
    // 选中事件，修改事件
    // editor.emit('selected:change', editor.getActiveObject())
    editor.render()
  }
</script>

<template>
  <div class="typeBar">
    <property-normal-item tip="Group" @click="doGroup">
      <el-icon size="20">
        <groupIcon></groupIcon>
      </el-icon>
    </property-normal-item>
  </div>
</template>

<style scoped lang="scss"></style>
