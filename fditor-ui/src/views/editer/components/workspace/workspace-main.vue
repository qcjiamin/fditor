<script lang="ts" setup>
  import { inject, ref } from 'vue'
  import { useContextMenu } from '@/components/contextMenu/useContextMenu'
  import type { MenuItem } from '@/components/contextMenu/type'
  import { getDefKey } from '@/utils/common'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@fditor/core'
  import type { TPointerEvent } from 'fabric'

  // import workspaceBar from './workspace-bar.vue'
  const containerRef = ref<HTMLDivElement | null>(null)
  defineExpose({
    //!暴露响应式属性，不输出.value
    containerRef: containerRef
  })

  // 注入 editor 实例
  const editor = inject(EditorKey) as Editor

  /**
   * 动态菜单工厂函数
   * 根据点击位置和选中的元素类型，动态生成菜单项
   */
  function createContextMenu(e: MouseEvent): MenuItem[] {
    // 1. 将鼠标坐标转换为画布坐标
    // const pointer = editor.stage.getViewportPoint(e as TPointerEvent)

    // 2. 获取点击位置的目标元素
    const target = editor.stage.findTarget(e as TPointerEvent)

    // 3. 根据目标元素类型生成不同的菜单
    if (!target) {
      // 点击空白区域
      return [
        {
          label: '粘贴',
          id: getDefKey(),
          icon: '📄',
          onSelect: () => {
            console.log('粘贴')
            // editor.paste()
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
        label: '复制',
        id: getDefKey(),
        icon: '📋',
        onSelect: () => {
          console.log('复制元素', target)
          // editor.copy()
        }
      },
      {
        label: '删除',
        id: getDefKey(),
        icon: '🗑️',
        onSelect: () => {
          console.log('删除元素', target)
          // editor.remove(target)
        }
      },
      {
        label: '分隔线',
        id: getDefKey(),
        divider: true
      },
      {
        label: '图层操作',
        id: getDefKey(),
        icon: '📚',
        submenu: [
          {
            label: '置于顶层',
            id: getDefKey(),
            shortcut: 'Ctrl+]',
            onSelect: () => {
              console.log('置于顶层', target)
              target.bringToFront()
              editor.render()
            }
          },
          {
            label: '置于底层',
            id: getDefKey(),
            shortcut: 'Ctrl+[',
            onSelect: () => {
              console.log('置于底层', target)
              target.sendToBack()
              editor.render()
            }
          }
        ]
      }
    ]

    // 根据元素类型添加特定菜单项
    if (elementType === 'image') {
      return [
        {
          label: '编辑图片',
          id: getDefKey(),
          icon: '✏️',
          onSelect: () => {
            console.log('编辑图片', target)
            // 打开图片编辑器
          }
        },
        {
          label: '裁剪图片',
          id: getDefKey(),
          icon: '✂️',
          onSelect: () => {
            console.log('裁剪图片', target)
            // editor.cropImage(target)
          }
        },
        ...commonMenuItems
      ]
    } else if (elementType === 'ftextbox' || elementType === 'i-text' || elementType === 'textbox') {
      return [
        {
          label: '编辑文本',
          id: getDefKey(),
          icon: '✏️',
          onSelect: () => {
            console.log('编辑文本', target)
            // target.enterEditing()
          }
        },
        {
          label: '字体样式',
          id: getDefKey(),
          icon: '🎨',
          submenu: [
            {
              label: '加粗',
              id: getDefKey(),
              onSelect: () => {
                console.log('加粗', target)
              }
            },
            {
              label: '斜体',
              id: getDefKey(),
              onSelect: () => {
                console.log('斜体', target)
              }
            }
          ]
        },
        ...commonMenuItems
      ]
    }

    // 默认菜单（其他类型元素）
    return commonMenuItems
  }

  // 使用动态菜单工厂函数
  const { onContextMenu } = useContextMenu(createContextMenu)
</script>

<template>
  <div class="workspace-main">
    <div class="pageContainer">
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
