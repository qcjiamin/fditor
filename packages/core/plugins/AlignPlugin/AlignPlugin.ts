// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import type { IPlugin } from '../../types'
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
    console.log('alignLeft')
  }
}
