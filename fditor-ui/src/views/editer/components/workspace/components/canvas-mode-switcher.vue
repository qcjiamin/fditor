<script lang="ts" setup>
  import moveIcon from '@/assets/icons/tool_move.svg'
  import penIcon from '@/assets/icons/tool_pen.svg'
  import pencilIcon from '@/assets/icons/tool_pencil.svg'
  import type { CanvasMode } from '@/types'
  import { useEditorStore } from '@/stores/editorStore'
  import { storeToRefs } from 'pinia'
  import { inject } from 'vue'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'

  const editorStore = useEditorStore()
  const { canvasMode } = storeToRefs(editorStore)

  const editor = inject(EditorKey) as Editor

  const modes = [
    { key: 'move' as const, label: 'Select', shortcut: 'V', icon: moveIcon },
    { key: 'pencil' as const, label: 'Pencil', shortcut: 'Shift+P', icon: pencilIcon },
    { key: 'pen' as const, label: 'Pen', shortcut: 'P', icon: penIcon }
  ]

  function changeMode(mode: CanvasMode) {
    if (mode === canvasMode.value) return
    // 先离开原有模式
    if (canvasMode.value === 'pencil') editor.leavePencilMode()
    if (canvasMode.value === 'pen') editor.leavePenMode()
    // 进入新模式
    if (mode === 'pencil') {
      editor.enterPencilMode(editorStore.brushStyle.brushType)
      if (!editor.stage.freeDrawingBrush) return
      // 业务逻辑：将笔触的style设置进去
      editor.stage.freeDrawingBrush.width = editorStore.brushStyle.lineWidth
      editor.stage.freeDrawingBrush.color = editorStore.brushStyle.color
    } else if (mode === 'pen') {
      if (canvasMode.value === 'move') {
        editor.stage.discardActiveObject()
      } else if (canvasMode.value === 'pen') {
        editor.leavePenMode()
      }
      editor.enterPenMode()
    } else if (mode === 'move') {
      editor.render()
    }

    console.log(`Canvas mode changed to: ${mode}`)
  }
</script>

<template>
  <div class="modeSwitcher">
    <div
      v-for="mode in modes"
      :key="mode.key"
      class="modeItem"
      :class="{ active: canvasMode === mode.key }"
      @click="changeMode(mode.key)"
    >
      <component :is="mode.icon" class="icon" />

      <!-- Tooltip -->
      <div class="tooltip">
        <span class="label">{{ mode.label }}</span>
        <span class="shortcut">{{ mode.shortcut }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .modeSwitcher {
    display: flex;
    gap: 8px;
    padding: 5px;
    position: absolute;
    z-index: 100;
    bottom: 16px;
    right: 16px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #f0f0f0;

    .modeItem {
      position: relative; /* For absolute positioning of tooltip */
      width: 30px; /* Fixed width for stability */
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #4b5563;

      .icon {
        width: 18px;
        height: 18px;
      }

      /* Hover Interaction */
      &:hover {
        background-color: #f3f4f6;

        .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-8px);
        }
      }

      /* Active State */
      &.active {
        background-color: #e5e7eb;
        color: #111827;
      }

      /* Tooltip Styling */
      .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        background-color: #1f2937; /* Dark gray/black bg */
        color: #ffffff;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 10;

        /* Little arrow pointing down */
        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: #1f2937 transparent transparent transparent;
        }

        .label {
          font-weight: 500;
        }

        .shortcut {
          color: #9ca3af; /* Light gray for shortcut */
          font-size: 11px;
        }
      }
    }
  }
</style>
