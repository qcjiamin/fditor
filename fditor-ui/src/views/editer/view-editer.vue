<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import editerHeader from './components/editer-header.vue'
  import editerSidebar from './components/sidebar/editer-sidebar.vue'
  import workspaceMain from './components/workspace/workspace-main.vue'
  // import workspaceTimeline from './components/workspace/workspace-timeline.vue'
  import propertyBar from '@/views/editer/components/propertyBar/property-bar.vue'
  // import { useEditor } from '@/hooks/useEditor'
  import { provide } from 'vue'
  import { EditorKey } from '../../constants/injectKey'
  import { Editor, SelectionPlugin, WorkspacePlugin } from '@kditor/core'
  import { useEditorStore } from '@/stores/editorStore'

  const mainRef = ref<InstanceType<typeof workspaceMain> | null>(null)
  const editorStore = useEditorStore()

  const editor = new Editor()
  window.editor = editor
  onMounted(() => {
    editor.init(document.querySelector('#canvas-container canvas')!)
    // 选择事件
    editor.on('selected:change', (selected) => {
      console.log('selected:change', selected)
      editorStore.setSelected(selected)
    })

    editor.use(WorkspacePlugin).use(SelectionPlugin)
    // 此时再通知属性条获取属性？ 因为默认选中背景条，但是画布初始化是在组件渲染之后 !! 需优化
    editor.emit('canvas:ready', null)
  })
  provide(EditorKey, editor)
</script>

<template>
  <div class="editer">
    <editer-header></editer-header>
    <div class="main">
      <editer-sidebar></editer-sidebar>
      <div class="workspace">
        <property-bar type="bg"></property-bar>
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
  }
</style>
