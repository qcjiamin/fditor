// import Editor from '../../Editor'
import { Editor } from '@kditor/core'
import type { IPlugin, KonvaNode } from '../../types'
import './methods'

export default class AlignPlugin implements IPlugin {
  #name: string = 'AlignPlugin'
  public editor!: Editor
  constructor() {}
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
  }
  alignLeft() {
    const shapes = this.editor.getActiveShapes()
    if (shapes) {
      shapes.forEach((shape: KonvaNode) => {
        // shape.('x', 0 + shape.width() / 2)
        shape.attrs.x = 0 + shape.width() / 2
      })
      this.editor.update(shapes)
    }
  }
}
