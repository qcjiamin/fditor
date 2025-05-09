import { Editor, WorkspacePlugin } from '@kditor/core'
import { computed, provide, ref, type Ref } from 'vue'
import { EditorKey, selectedKey, SelectTypeKey } from '@/constants/injectKey'
import type { Selected } from '@/utils/types'
import type { ElementTypes } from '@/utils/types'
// import type { KonvaNode } from '../../../core/types'

export const useEditor = () => {
  let editor = null
  editor = new Editor()
  window.editor = editor
  const selected = ref<Selected>(null)
  const selectType = computed<ElementTypes>(() => {
    if (!selected.value) {
      return 'bg'
    } else {
      return selected.value.type as ElementTypes
    }
  })

  editor.on('plugin:installed', (plugin) => {
    console.log(`%c${plugin.name} installed`, 'color: green')
  })

  // editor.on('selected:change', (args) => {
  //   console.log(args)
  //   selected.value = args.now
  //   // 通知当前选中的元素修改了
  // })
  editor.use(WorkspacePlugin)
  // editor.use(SelectionPlugin)
  // editor.use(AlignPlugin)
  // editor.use(BackgroundPlugin)
  console.log('provide key')
  provide(EditorKey, editor)
  provide(selectedKey, selected as Ref<Selected>)
  provide(SelectTypeKey, selectType)

  return { editor }
}
