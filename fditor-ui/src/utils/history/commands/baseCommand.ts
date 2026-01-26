import type { Editor } from '@fditor/core'

abstract class BaseCommand {
  editor: Editor
  constructor(editor: Editor) {
    this.editor = editor
  }
  abstract do(): Promise<void>
  abstract undo(): Promise<void>
}

export default BaseCommand
