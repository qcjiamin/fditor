//todo: control加载图标和设置理论上得在实例化Canvas之前，调用静态方法,use插件在canvas实例化之后才调用
// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import type { IPlugin } from '../../types'
import './methods'
import { insertLockRule } from '../../polyfill/canvas'

export default class LockPlugin implements IPlugin {
  #name: string = 'LockPlugin'
  public editor!: Editor
  constructor() {}
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
    insertLockRule()
    // 可以在这里替换控制点？
  }
}
