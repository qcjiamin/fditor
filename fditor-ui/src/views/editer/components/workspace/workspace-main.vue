<script lang="ts" setup>
  import { computed, inject, ref } from 'vue'
  import { useContextMenu } from '@/components/contextMenu/useContextMenu'
  import type { MenuItem } from '@/components/contextMenu/type'
  import { getDefKey } from '@/utils/common'
  import { EditorKey } from '@/constants/injectKey'
  import { isActiveSelection, isGroup, type Editor } from '@fditor/core'
  import { type TPointerEvent } from 'fabric'
  import CanvasModeSwitcher from './components/canvas-mode-switcher.vue'
  import { useEditorStore } from '@/stores/editorStore'

  const editorStore = useEditorStore()
  const containerRef = ref<HTMLDivElement | null>(null)
  defineExpose({
    //!暴露响应式属性，不输出.value
    containerRef: containerRef
  })

  const cursorByCanvasMode = computed(() => {
    switch (editorStore.canvasMode) {
      case 'move':
        return ''
      case 'pencil':
        return 'cursor-pencil'
      case 'pen':
        return 'cursor-pen'
      default:
        return ''
    }
  })
  // 注入 editor 实例
  const editor = inject(EditorKey) as Editor

  /**
   * 动态菜单工厂函数
   * 根据点击位置和选中的元素类型，动态生成菜单项
   */
  async function createContextMenu(e: MouseEvent): Promise<MenuItem[]> {
    const hasCopyStr = await editor.hasCopyStr()

    // 1. 将鼠标坐标转换为画布坐标
    // const pointer = editor.stage.getViewportPoint(e as TPointerEvent)

    // 2. 获取点击位置的目标元素
    const target = editor.stage.findTarget(e as TPointerEvent)

    // 3. 根据目标元素类型生成不同的菜单
    if (!target) {
      editor.stage.discardActiveObject()
      editor.render()
      // 点击空白区域
      return [
        {
          label: 'Paste',
          id: getDefKey(),
          // icon: '📄',
          disabled: !hasCopyStr,
          shortcut: 'Ctrl+V',
          onSelect: () => {
            editor.paste()
          }
        }
      ]
    } else {
      // 先选中右键点击到的元素
      editor.stage.setActiveObject(target)
      editor.render()
    }

    // 点击了某个元素
    const elementType = target.type // 'image', 'text', 'rect', etc.

    // 通用菜单项
    const commonMenuItems: MenuItem[] = [
      {
        label: 'Copy',
        id: getDefKey(),
        // icon: '📋',
        shortcut: 'Ctrl+C',
        onSelect: () => {
          editor.copy(target)
          console.log('复制元素', target)
        }
      },
      {
        label: '分隔线',
        id: getDefKey(),
        divider: true
      },
      {
        label: 'Move forward',
        id: getDefKey(),
        shortcut: 'Ctrl+]',
        onSelect: () => {
          const obj = editor.getActiveObject()
          if (!obj) return
          obj.bringForward()
        }
      },
      {
        label: 'Move back',
        id: getDefKey(),
        shortcut: 'Ctrl+[',
        onSelect: () => {
          const obj = editor.getActiveObject()
          if (!obj) return
          obj.sendBackwards()
        }
      },
      {
        label: 'Bring to top',
        id: getDefKey(),
        shortcut: 'Ctrl+Alt+]',
        onSelect: () => {
          const obj = editor.getActiveObject()
          if (!obj) return
          obj.bringToFront()
        }
      },
      {
        label: 'Send to back',
        id: getDefKey(),
        shortcut: 'Ctrl+Alt+[',
        onSelect: () => {
          const obj = editor.getActiveObject()
          if (!obj) return
          obj.sendToBack()
        }
      },
      {
        label: '分隔线',
        id: getDefKey(),
        divider: true
      },
      {
        label: 'Delete',
        id: getDefKey(),
        shortcut: 'Delete',
        onSelect: () => {
          console.log('删除元素', target)
          editor.remove()
        }
      }
    ]

    if (elementType === 'activeselection') {
      return [
        {
          label: 'Group',
          id: getDefKey(),
          shortcut: 'Ctrl+G',
          onSelect: () => {
            const obj = editor.getActiveObject()
            if (!obj) return
            if (isActiveSelection(obj)) {
              obj.toGroup()
            }
          }
        },
        {
          label: '分隔线',
          id: getDefKey(),
          divider: true
        },
        ...commonMenuItems
      ]
    } else if (elementType === 'group') {
      return [
        {
          label: 'unGroup',
          id: getDefKey(),
          shortcut: 'Ctrl+G',
          onSelect: () => {
            const obj = editor.getActiveObject()
            if (!obj) return
            if (isGroup(obj)) {
              obj.toActiveSelection()
            }
          }
        },
        {
          label: '分隔线',
          id: getDefKey(),
          divider: true
        },
        ...commonMenuItems
      ]
    } else {
      return commonMenuItems
    }
  }

  // 使用动态菜单工厂函数
  const { onContextMenu } = useContextMenu(createContextMenu)
</script>

<template>
  <div class="workspace-main">
    <div class="pageContainer" :class="[cursorByCanvasMode]">
      <canvas-mode-switcher></canvas-mode-switcher>
      <div id="canvas-container" ref="containerRef" @contextmenu="onContextMenu">
        <!-- <canvas></canvas> -->
      </div>
    </div>
    <!-- <workspace-bar></workspace-bar> -->
  </div>
</template>

<style scoped lang="scss">
  .workspace-main {
    display: flex;
    flex-direction: column;
    .pageContainer {
      &.cursor-pencil {
        cursor:
          url('@/assets/icons/cursor-pencil.svg') 5 23,
          auto;
      }
      background-color: #e8e8ea;
      position: relative;
      flex-grow: 1;
      #canvas-container {
        position: absolute;
        inset: 0; // 填充父容器，使其有实际的可点击区域
        // background-color: rgb(68, 66, 62);
        // flex-grow: 1;
        // display: flex;
        // align-items: center;
        // justify-content: center;
      }
    }
  }
</style>
