// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import './methods'
import BasePlugin from '../BasePlugin'

export default class AlignPlugin extends BasePlugin {
  #name: string = 'AlignPlugin'
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
  alignLeft() {
    console.log('alignLeft')
  }
}
