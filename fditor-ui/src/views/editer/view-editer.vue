<script setup lang="ts">
  import { onMounted, onUnmounted, ref, toRaw, useTemplateRef, watch, type Component } from 'vue'
  import editerHeader from './components/editer-header.vue'
  import editerSidebar from './components/sidebar/editer-sidebar.vue'
  import workspaceMain from './components/workspace/workspace-main.vue'
  // import workspaceTimeline from './components/workspace/workspace-timeline.vue'
  import propertyBar from '@/views/editer/components/propertyBar/property-bar.vue'
  // import { useEditor } from '@/hooks/useEditor'
  import { provide } from 'vue'
  import { EditorKey } from '../../constants/injectKey'
  import {
    Editor,
    LockPlugin,
    PencilPlugin,
    SelectionPlugin,
    SnapPlugin,
    WorkspacePlugin,
    PenPlugin
  } from '@fditor/core'
  import { useEditorStore } from '@/stores/editorStore'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import HistoryPlugin from '@/pluginForEditor/HistoryPlugin/HistoryPlugin.ts'
  import CropPlugin from '@/pluginForEditor/CropPlugin/CropPlugin'
  import type { CanvasStates } from '@/utils/types'
  import ClipBar from '@/views/editer/components/propertyBar/clip-bar.vue'
  import { onClickOutside, useResizeObserver } from '@vueuse/core'
  import { useEditorHotkeys } from '@/hooks/useEditorHotkeys'
  import { eventBus } from '@/events/eventBus'
  import loginBox from '@/views/editer/login-box.vue'
  import { getProjectByID, requestSaveProject } from '@/utils/request'
  import { createProject, uploadEditorThumbnail } from '@/utils/workflow'
  import PencilBar from '@/views/editer/components/propertyBar/pencilBar/pencil-bar.vue'
  import PenBar from '@/views/editer/components/propertyBar/penBar/pen-bar.vue'
  import { cursorMap } from '@/utils/cursor'
  import { useSelect } from '@/stores/commands/useSelect'
  import { getIdsFromObject } from '@/stores/utils/util'

  const mainRef = ref<InstanceType<typeof workspaceMain>>(null!)

  const editor = new Editor()
  provide(EditorKey, editor)
  const editorStore = useEditorStore()
  editorStore.setEditor(editor)
  const { setSelect } = useSelect(editor)
  let handler: ReturnType<typeof setTimeout>
  window.editor = editor
  onMounted(async () => {
    await editor.init(mainRef.value.containerRef!)
    const containerSize = { width: 0, height: 0 }
    useResizeObserver(mainRef.value, (entries) => {
      const entry = entries[0]
      const { width, height } = entry.contentRect
      containerSize.width = width
      containerSize.height = height
      editor.autoSize(width, height)
    })
    editor.on('layout:change', () => {
      editor.autoSize(containerSize.width, containerSize.height)
    })
    // 选择事件
    editor.on('selected:change', (selected) => {
      eventBus.emit('fontFamily:load:cancel')
      const seletedIds = getIdsFromObject(selected)
      const beforeIds = toRaw(editorStore.undoableStates.selectedIds)
      if (!editorStore.isHistoryLocked) {
        editorStore.setSelected(seletedIds)
      }
      // 先记录之前选择的
      // 再获取当前选择的
      setSelect(beforeIds, seletedIds)
    })

    editor.on('confirm:clip', () => {
      editorStore.setCvsState('normal')
    })
    editor.on('subPenType:change', ({ newType }) => {
      if (newType === 'pen') {
        console.log('enter pen mode')
        editor.stage.setCursor(cursorMap[newType])
      } else {
        editor.stage.setCursor('default')
      }
      editorStore.setPenSubType(newType)
    })
    editor.on('enter:penMode', () => {
      editorStore.setCanvasMode('pen')
    })
    editor.on('exit:penMode', () => {
      editorStore.setCanvasMode('move')
    })
    editor.on('enter:pencilMode', () => {
      console.log('enter pencil mode')
      // 设置cursor样式
      // editor.stage.setCursor(cursorMap.pencil)
      //? 画笔模式设置父容器，因为原生的mousemove事件里会修改cursor样式
      editor.stage.upperCanvasEl.parentElement!.style.cursor = cursorMap.pencil
      editorStore.setCanvasMode('pencil')
    })
    editor.on('exit:pencilMode', () => {
      editorStore.setCanvasMode('move')
    })
    eventBus.addListener('config:save', (timeout) => {
      if (handler) {
        clearTimeout(handler)
      }
      editorStore.setSaveState('unsaved')
      handler = setTimeout(async () => {
        // 拿图片
        editorStore.setSaveState('saving')
        // 没有id， 未登录状态，不保存
        if (!editorStore.projectID) return
        const url = await uploadEditorThumbnail(editor, editorStore.projectID!)
        if (!editorStore.projectID) throw new Error('save config but do not have projectID')
        // 保存配置
        await requestSaveProject({
          id: editorStore.projectID,
          project_data: editor.toJSON(),
          preview_image_url: url
        })
        editorStore.setSaveState('saved')
        // 保存完成
      }, timeout)
    })
    await editor.useAll(
      WorkspacePlugin,
      SelectionPlugin,
      // HistoryPlugin,
      CropPlugin,
      LockPlugin,
      SnapPlugin,
      PencilPlugin,
      PenPlugin
    )
    // 平台初始化完成，加载工程配置
    // 获取工程配置
    const url = new window.URL(window.location.href)
    const projectID = url.searchParams.get('id')
    if (!projectID) {
      await createProject(editor, editorStore)
    } else {
      // 读取配置加载
      // 请求工程配置
      const res = await getProjectByID(Number(projectID))
      editor._fromJSON(res.project_data)
      editorStore.setProjectID(Number(projectID))
      editorStore.setProjectName(res.project_name)
    }

    // 此时再通知属性条获取属性？ 因为默认选中背景条，但是画布初始化是在组件渲染之后 !! 需优化
    // historyPlugin 添加第一条记录也用到此消息
    //! 画布的工作区调整之后，在记录初始历史
    setTimeout(() => {
      editor.emit('canvas:ready', null)
    }, 0)
  })

  useEditorHotkeys(editor)

  onUnmounted(() => {
    editor.dispose()
  })

  const barTypeComponents: Record<CanvasStates, Component> = {
    normal: propertyBar,
    clip: ClipBar,
    pencil: PencilBar,
    pen: PenBar
  }

  const workspaceRef = useTemplateRef<HTMLElement>('workspace')
  onClickOutside(workspaceRef, () => {
    if (editorStore.cvsState === 'clip') {
      editor.confirmClip()
      editorStore.setCvsState('normal')
    }
  })

  watch(
    () => editorStore.canvasMode,
    (newState) => {
      console.log(newState, 11111)
      if (newState === 'pencil') {
        editorStore.setCvsState('pencil')
      } else if (newState === 'pen') {
        editorStore.setCvsState('pen')
      } else {
        editorStore.setCvsState('normal')
      }
    }
  )
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
