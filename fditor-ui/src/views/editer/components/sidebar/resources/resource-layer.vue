<script lang="ts" setup>
  import frontIcon from '@/assets/icons/layerTab/front.svg'
  import forwardIcon from '@/assets/icons/layerTab/forward.svg'
  import backIcon from '@/assets/icons/layerTab/back.svg'
  import backwordIcon from '@/assets/icons/layerTab/backward.svg'
  import { useEditorStore } from '@/stores/editorStore'
  import type { FabricObject } from 'fabric'
  import layerList from './components/layer-list.vue'
  // import { inject } from 'vue'
  // import { EditorKey } from '@/constants/injectKey'
  // import type { Editor } from '@fditor/core'
  const editorStore = useEditorStore()
  const selected = editorStore.selected as FabricObject
  // const editor = inject(EditorKey) as Editor

  // 图层操作函数
  const bringToFront = () => {
    console.log('Bring to front')
    selected.bringToFront()
  }

  const bringForward = () => {
    console.log('Bring forward')
    selected.bringForward()
  }

  const sendToBack = () => {
    console.log('Send to back')
    selected.sendToBack()
  }

  const sendBackward = () => {
    console.log('Send backward')
    selected.sendBackwards()
  }
</script>

<template>
  <div class="layerTab">
    <div class="header">Layers</div>

    <div class="layer-actions">
      <div class="actions-row">
        <!-- Bring forward -->
        <button class="layer-btn" @click="bringForward">
          <el-icon size="16">
            <forwardIcon></forwardIcon>
          </el-icon>
          <span>Forward</span>
        </button>
        <!-- Bring to front -->
        <button class="layer-btn" @click="bringToFront">
          <el-icon size="16">
            <frontIcon></frontIcon>
          </el-icon>
          <span>Front</span>
        </button>
      </div>

      <div class="actions-row">
        <!-- Send backward -->
        <button class="layer-btn" @click="sendBackward">
          <el-icon size="16">
            <backwordIcon></backwordIcon>
          </el-icon>
          <span>Backward</span>
        </button>
        <!-- Send to back -->
        <button class="layer-btn" @click="sendToBack">
          <el-icon size="16">
            <backIcon></backIcon>
          </el-icon>
          <span>Back</span>
        </button>
      </div>
    </div>

    <div class="layers">
      <!-- 图层列表将在这里显示 -->
      <layer-list></layer-list>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .layerTab {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background-color: #fff;

    .header {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      text-transform: capitalize;
    }

    .layer-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }

    .actions-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .layer-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      text-align: left;
      color: #1a1a1a;
      font-size: 13px;
      min-width: 0; // 允许按钮收缩

      .icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        stroke: currentColor;
      }

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0; // 允许文字收缩
      }

      &:hover:not(.disabled) {
        background-color: #f5f5f5;
      }

      &:active:not(.disabled) {
        background-color: #e8e8e8;
      }

      &.disabled {
        color: #bfbfbf;
        cursor: not-allowed;

        .icon {
          stroke: #bfbfbf;
        }
      }
    }

    .layers {
      flex: 1;
      min-height: 300px; // 确保有足够的高度显示内容
      overflow-y: auto;
      border-top: 1px solid #e8e8e8;
      padding-top: 16px;
    }
  }
</style>
