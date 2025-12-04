import type { Editor } from '@fditor/core'

declare global {
  interface Window {
    editor: Editor
  }
}

export {}
