// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import './methods'
import BasePlugin from '../BasePlugin'

export default class PenPlugin extends BasePlugin {
  #name: string = 'PenPlugin'
  public editor!: Editor
  constructor() {
    super()
  }
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
  }
}
