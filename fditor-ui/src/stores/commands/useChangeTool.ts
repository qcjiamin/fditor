import { useEditorStore } from '@/stores/editorStore'
import type { CanvasMode } from '@/types'
// type ModifyAttrs = Partial<FabricObjectProps>
export const useChangeTool = () => {
  const editorStore = useEditorStore()
  // const editor = inject(EditorKey) as Editor
  const oldTool = editorStore.canvasMode
  const changeTool = async (tool: CanvasMode) => {
    editorStore.registerCommand({
      do: async () => {
        editorStore.setCanvasMode(tool)
      },
      undo: async () => {
        editorStore.setCanvasMode(oldTool)
      }
    })
  }
  return { changeTool }
}
