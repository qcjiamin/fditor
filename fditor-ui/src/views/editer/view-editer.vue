<script setup lang="ts">
  import { onMounted, onUnmounted, ref, useTemplateRef, type Component } from 'vue'
  import editerHeader from './components/editer-header.vue'
  import editerSidebar from './components/sidebar/editer-sidebar.vue'
  import workspaceMain from './components/workspace/workspace-main.vue'
  // import workspaceTimeline from './components/workspace/workspace-timeline.vue'
  import propertyBar from '@/views/editer/components/propertyBar/property-bar.vue'
  // import { useEditor } from '@/hooks/useEditor'
  import { provide } from 'vue'
  import { EditorKey } from '../../constants/injectKey'
  import { Editor, LockPlugin, SelectionPlugin, SnapPlugin, WorkspacePlugin } from '@fditor/core'
  import { useEditorStore } from '@/stores/editorStore'
  import HistoryPlugin from '@/pluginForEditor/HistoryPlugin/HistoryPlugin.ts'
  import CropPlugin from '@/pluginForEditor/CropPlugin/CropPlugin'
  import type { CanvasStates } from '@/utils/types'
  import ClipBar from '@/views/editer/components/propertyBar/clip-bar.vue'
  import { onClickOutside } from '@vueuse/core'
  import hotkeys from 'hotkeys-js'
  import { eventBus } from '@/events/eventBus'
  import loginBox from '@/views/editer/login-box.vue'
  import { getProjectByID, requestAddProject, uploadFile } from '@/utils/request'

  const mainRef = ref<InstanceType<typeof workspaceMain> | null>(null)
  const editorStore = useEditorStore()

  const editor = new Editor()
  // window.editor = editor
  onMounted(async () => {
    await editor.init(document.querySelector('#canvas-container canvas')!)
    // 选择事件
    editor.on('selected:change', (selected) => {
      console.log('selected:change', selected)
      eventBus.emit('fontFamily:load:cancel')
      editorStore.setSelected(selected)
    })

    editor.on('confirm:clip', () => {
      editorStore.setCvsState('normal')
    })
    await editor.useAll(WorkspacePlugin, SelectionPlugin, HistoryPlugin, CropPlugin, LockPlugin, SnapPlugin)
    // 平台初始化完成，加载工程配置
    // 获取工程配置
    const url = new window.URL(window.location.href)
    const projectID = url.searchParams.get('id')
    if (!projectID) {
      const thumBlob = await editor.getPreviewThum()
      const uploadRes = await uploadFile(thumBlob, `${Date.now()}.png`)

      // 保存配置
      await requestAddProject({
        project_name: 'Untitled',
        project_data: editor.toJSON(),
        preview_image_url: uploadRes.url
      })
    } else {
      // 读取配置加载
      // 请求工程配置
      const res = await getProjectByID(Number(projectID))
      editor._fromJSON(res.config)
    }

    // 此时再通知属性条获取属性？ 因为默认选中背景条，但是画布初始化是在组件渲染之后 !! 需优化
    // historyPlugin 添加第一条记录也用到此消息
    //! 画布的工作区调整之后，在记录初始历史
    setTimeout(() => {
      console.log('ready')
      editor.emit('canvas:ready', null)
    }, 0)

    hotkeys('left, right, up, down', function (_e, handler) {
      const selected = editor.getActiveObject()
      if (!selected) return
      switch (handler.key) {
        case 'left':
          selected.eset('left', selected.left - 1)
          break
        case 'right':
          selected.eset('left', selected.left + 1)
          break
        case 'up':
          selected.eset('top', selected.top - 1)
          break
        case 'down':
          selected.eset('top', selected.top + 1)
          break
        default:
          break
      }
    })
  })
  onUnmounted(() => {
    hotkeys.unbind('left, right, up, down')
  })
  provide(EditorKey, editor)

  const barTypeComponents: Record<CanvasStates, Component> = {
    normal: propertyBar,
    clip: ClipBar
  }

  const workspaceRef = useTemplateRef<HTMLElement>('workspace')
  onClickOutside(workspaceRef, () => {
    console.log('click outside')
    if (editorStore.cvsState === 'clip') {
      editor.confirmClip()
      editorStore.setCvsState('normal')
    }
  })
</script>

<template>
  <div class="editer">
    <login-box v-if="editorStore.showLoginBox" class="loginBox"></login-box>
    <editer-header></editer-header>
    <div class="main">
      <editer-sidebar></editer-sidebar>
      <div ref="workspace" class="workspace">
        <component :is="barTypeComponents[editorStore.cvsState]"></component>
        <!-- <property-bar type="bg"></property-bar> -->
        <workspace-main ref="mainRef" class="workspace-main"></workspace-main>
        <!-- <workspace-timeline></workspace-timeline> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use '@/styles/variables.scss' as *;
  .editer {
    flex-direction: column;
    display: flex;
    height: 100vh;
    width: 100vw;
    .main {
      display: flex;
      height: calc(100% - $EDITER_HEADER_HEIGHT);
      .workspace {
        flex-grow: 1;
        // width: calc();
        height: 100%;
        display: flex;
        flex-direction: column;
        .workspace-main {
          flex-grow: 1;
        }
      }
    }
    .loginBox {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 99;
    }
  }
</style>
