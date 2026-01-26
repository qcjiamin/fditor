<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { SaveState2ShowString } from '@/utils/constants'
  import { inject, ref, onMounted, computed } from 'vue'
  import { EditorKey } from '@/constants/injectKey'
  import { Layout } from '@fditor/core'
  import { ArrowDown, Check } from '@element-plus/icons-vue'
  import historyBox from '@/views/editer/components/header/components/history-box.vue'
  import tipLabel from '@/views/editer/components/propertyBar/components/tip-label.vue'

  const editorStore = useEditorStore()
  const editor = inject(EditorKey)
  const currentLayout = ref<Layout>(Layout.Portrait)

  const layoutOptions = [
    {
      label: '16:9 Landscape',
      desc: 'YouTube, Facebook',
      value: Layout.Landscape,
      iconClass: 'icon-landscape'
    },
    {
      label: '9:16 Portrait',
      desc: 'TikTok, IG Reels, Stories',
      value: Layout.Portrait,
      iconClass: 'icon-portrait'
    },
    {
      label: '1:1 Square',
      desc: 'Instagram Post',
      value: Layout.Square,
      iconClass: 'icon-square'
    }
  ]

  const currentLayoutLabel = computed(() => {
    const option = layoutOptions.find((opt) => opt.value === currentLayout.value)
    // 简化的显示，如 "9:16" 或 "16:9"
    if (option) {
      return option.label.split(' ')[0]
    }
    return currentLayout.value
  })

  const currentLayoutIconClass = computed(() => {
    const option = layoutOptions.find((opt) => opt.value === currentLayout.value)
    return option ? option.iconClass : ''
  })

  const handleCommand = (command: Layout) => {
    if (!editor) return
    editor.layout = command
    currentLayout.value = command
  }

  onMounted(() => {
    if (editor) {
      currentLayout.value = editor.layout
      editor.on('layout:change', () => {
        currentLayout.value = editor.layout
      })
    }
  })
</script>

<template>
  <div class="header">
    <div class="header-left">
      <div class="name">{{ editorStore.projectName }}</div>
      <historyBox></historyBox>
      <tip-label tip="test" shortcut="ctrl+z">
        <template #anchor>
          <div class="fillAnchor"> test </div>
        </template>
      </tip-label>
      <div class="saveState">{{ SaveState2ShowString[editorStore.saveState] }}</div>
    </div>
    <div class="header-center">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="layout-trigger">
          <div class="layout-icon-mini" :class="currentLayoutIconClass"></div>
          <span class="layout-label">{{ currentLayoutLabel }}</span>
          <el-icon class="arrow-icon">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="layout-dropdown-menu">
            <el-dropdown-item
              v-for="item in layoutOptions"
              :key="item.value"
              :command="item.value"
              class="layout-item"
              :class="{ active: currentLayout === item.value }"
            >
              <div class="item-content">
                <div class="item-icon">
                  <div :class="item.iconClass"></div>
                </div>
                <div class="item-text">
                  <div class="item-title">{{ item.label }}</div>
                  <div class="item-desc">{{ item.desc }}</div>
                </div>
                <div v-if="currentLayout === item.value" class="item-check">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="header-right">
      <button class="preview-btn">preview</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .header {
    height: $EDITER_HEADER_HEIGHT;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f9fafb; // Light gray background similar to Figma
    padding: 0 16px;
    position: relative;
    border-bottom: 1px solid #e5e7eb; // Subtle border similar to resource-menu.vue
    box-sizing: border-box;

    .header-left {
      display: flex;
      align-items: center;
      column-gap: 12px; // Increased spacing for cleaner look

      .name {
        color: #374151; // Darker gray for better readability
        font-size: 14px;
        font-weight: 500;
      }

      .saveState {
        font-size: 12px;
        color: #6b7280; // Muted color for non-critical info
        background-color: #f3f4f6; // Light background for subtle contrast
        padding: 2px 8px;
        border-radius: 12px; // Pill shape
      }
    }

    .header-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .layout-trigger {
      display: flex;
      align-items: center;
      background-color: white;
      border: 1px solid #d1d5db; // Subtle border
      border-radius: 6px; // More square corners, less rounded
      padding: 6px 12px;
      cursor: pointer;
      transition: all 0.2s;
      height: 32px;
      box-sizing: border-box;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow

      &:hover {
        background-color: #f9fafb; // Lighter hover state
        border-color: #9ca3af; // Subtle border change on hover
      }

      .layout-icon-mini {
        border: 1px solid #9ca3af; // Muted color for icon border
        border-radius: 2px;
        margin-right: 8px;
        box-sizing: border-box;

        &.icon-landscape {
          width: 14px;
          height: 8px;
        }
        &.icon-portrait {
          width: 8px;
          height: 14px;
        }
        &.icon-square {
          width: 10px;
          height: 10px;
        }
      }

      .layout-label {
        font-size: 14px;
        font-weight: 500; // Slightly less bold for cleaner look
        color: #374151;
        margin-right: 6px;
      }

      .arrow-icon {
        font-size: 14px;
        color: #6b7280; // Muted arrow color
      }
    }

    .header-right {
      .preview-btn {
        display: inline-flex;
        flex-direction: row;
        flex: 0 0 auto;
        position: relative;
        align-items: center;
        justify-content: center;
        padding: 4px 12px; // Less padding for cleaner look
        height: 32px;
        border-radius: 6px; // More square corners
        user-select: none;
        font-weight: 500; // Less bold
        font-size: 14px;
        transition: all 0.2s ease-out;
        background: white; // Solid background to match Figma style
        border: 1px solid #d1d5db; // Subtle border
        color: #374151; // Darker text
        min-width: 80px;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow

        &:hover {
          background: #f9fafb; // Lighter hover state
          border-color: #9ca3af; // Subtle border change on hover
        }
      }
    }
  }
</style>

<style lang="scss">
  // Global styles for dropdown menu items
  .layout-dropdown-menu {
    padding: 8px;
    border-radius: 8px !important; // More square corners
    min-width: 240px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06); // Figma-style shadow
    border: 1px solid #e5e7eb; // Subtle border

    .el-dropdown-menu__item {
      padding: 0 !important;
      border-radius: 6px; // More square corners
      margin-bottom: 4px;
      background: white; // Explicit white background

      &:last-child {
        margin-bottom: 0;
      }

      &:hover,
      &.active {
        background-color: #f9fafb !important; // Light hover/active state
      }
    }

    .item-content {
      display: flex;
      align-items: center;
      padding: 10px 12px; // More generous padding
      width: 100%;
      box-sizing: border-box;

      .item-icon {
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;

        div {
          border: 1px solid #d1d5db; // Muted border color
          border-radius: 3px;
          box-sizing: border-box;
        }

        .icon-landscape {
          width: 20px;
          height: 12px;
        }
        .icon-portrait {
          width: 12px;
          height: 20px;
        }
        .icon-square {
          width: 16px;
          height: 16px;
        }
      }

      .item-text {
        flex: 1;
        display: flex;
        flex-direction: column;

        .item-title {
          font-size: 14px;
          font-weight: 500; // Less bold
          color: #374151;
          line-height: 1.2;
        }

        .item-desc {
          font-size: 12px;
          color: #6b7280; // Muted description color
          margin-top: 2px;
        }
      }

      .item-check {
        margin-left: 12px;
        color: #4f46e5; // Use theme color for checkmark
        font-size: 16px;
      }
    }
  }
</style>
