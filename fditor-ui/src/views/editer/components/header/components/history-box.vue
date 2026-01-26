<script lang="ts" setup>
  import undoIcon from '@/assets/icons/historybar/undo.svg'
  import redoIcon from '@/assets/icons/historybar/redo.svg'
  import { useEditorStore } from '@/stores/editorStore'
  import { computed } from 'vue'
  const editorStore = useEditorStore()
  const disableUndo = computed(() => !editorStore.canUndo)
  const disableRedo = computed(() => !editorStore.canRedo)

  console.log(disableRedo, disableUndo)
  function undo() {
    if (!editorStore.canUndo) return
    editorStore.undo()
  }
  function redo() {
    if (!editorStore.canRedo) return
    editorStore.redo()
  }
  const keys = ['ctrl', 'z']
</script>

<template>
  <div class="historyBox">
    <el-tooltip content="Undo (ctrl+z)" :trigger-keys="keys" :disabled="!editorStore.canUndo">
      <div ref="anchor" class="anchorBox" :class="{ disable: disableUndo }" @click="undo">
        <undoIcon class="figma-icon"></undoIcon>
      </div>
    </el-tooltip>
    <el-tooltip content="Redo (ctrl+shift+z)" :disabled="!editorStore.canUndo">
      <div ref="anchor" class="anchorBox" :class="{ disable: disableRedo }" @click="redo">
        <redoIcon class="figma-icon"></redoIcon>
      </div>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
  .historyBox {
    display: flex;
    gap: 10px;
    .anchorBox {
      width: 24px;
      height: 24px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        background-color: #f5f7fa;
        border-color: #e0e0e0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      &.disable {
        pointer-events: none;
        opacity: 0.5;
        background-color: #f5f7fa;
      }
    }
  }
</style>
