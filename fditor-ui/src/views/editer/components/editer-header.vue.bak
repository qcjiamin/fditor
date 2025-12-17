<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { SaveState2ShowString } from '@/utils/constants'
  import { inject, ref, onMounted, computed } from 'vue'
  import { EditorKey } from '@/constants/injectKey'
  import { Layout } from '@fditor/core'
  import { ArrowDown, Check } from '@element-plus/icons-vue'

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
    background-color: rgb(22, 23, 26);
    padding: 0 16px;
    position: relative;

    .header-left {
      display: flex;
      align-items: center;
      column-gap: 10px;
      .name {
        color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
      }
      .saveState {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
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
      border-radius: 20px;
      padding: 4px 12px;
      cursor: pointer;
      transition: all 0.2s;
      height: 32px;
      box-sizing: border-box;

      &:hover {
        background-color: #f0f0f0;
      }

      .layout-icon-mini {
        border: 1.5px solid #333;
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
        font-weight: 600;
        color: #333;
        margin-right: 4px;
      }

      .arrow-icon {
        font-size: 12px;
        color: #333;
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
        padding: 0px 16px;
        height: 32px;
        border-radius: 8px;
        user-select: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease-out;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        min-width: 80px;
        cursor: pointer;
        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }
</style>

<style lang="scss">
  // Global styles for dropdown menu items
  .layout-dropdown-menu {
    padding: 8px;
    border-radius: 12px !important;
    min-width: 240px;

    .el-dropdown-menu__item {
      padding: 0 !important;
      border-radius: 8px;
      margin-bottom: 4px;
      &:last-child {
        margin-bottom: 0;
      }
      &:hover,
      &.active {
        background-color: #f5f5f5;
      }
    }

    .item-content {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      width: 100%;
      box-sizing: border-box;

      .item-icon {
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;

        div {
          border: 2px solid #333;
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
          font-weight: 600;
          color: #333;
          line-height: 1.2;
        }

        .item-desc {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }

      .item-check {
        margin-left: 12px;
        color: #333;
        font-size: 16px;
      }
    }
  }
</style>
