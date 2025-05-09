<script setup lang="ts">
  import { computed, onMounted, ref, type Ref } from 'vue'
  import editerHeader from './components/editer-header.vue'
  import editerSidebar from './components/sidebar/editer-sidebar.vue'
  import workspaceMain from './components/workspace/workspace-main.vue'
  // import workspaceTimeline from './components/workspace/workspace-timeline.vue'
  import propertyBar from '@/views/editer/components/propertyBar/property-bar.vue'
  // import { useEditor } from '@/hooks/useEditor'
  import { provide } from 'vue'
  import { EditorKey, selectedKey, SelectTypeKey } from '../../constants/injectKey'
  import type { ElementTypes, Selected } from '@/utils/types'
  import { Editor, SelectionPlugin, WorkspacePlugin } from '@kditor/core'

  const mainRef = ref<InstanceType<typeof workspaceMain> | null>(null)
  const selectedRef = ref<Selected>(undefined)

  const type2Type: Record<string, ElementTypes> = {
    circle: 'Shape',
    rect: 'Shape'
  }

  const selectType = computed<ElementTypes>(() => {
    if (!selectedRef.value) {
      return 'bg'
    } else {
      return type2Type[selectedRef.value.type] as ElementTypes
    }
  })

  // const { editor } = useEditor()
  const editor = new Editor()
  onMounted(() => {
    editor.init(document.querySelector('#canvas-container canvas')!)
    // 选择事件
    editor.on('selected:change', (selected) => {
      console.log('selected:change', selected)
      selectedRef.value = selected
    })

    editor.use(WorkspacePlugin).use(SelectionPlugin)
  })
  provide(EditorKey, editor)
  provide(selectedKey, selectedRef as Ref<Selected>)
  provide(SelectTypeKey, selectType)
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
