//todo: control加载图标和设置理论上得在实例化Canvas之前，调用静态方法,use插件在canvas实例化之后才调用
// import Editor from '../../Editor'
import { Editor, FCanvas } from '@fditor/core'
import './methods'
import { insertLockRule } from '../../polyfill/canvas'
import { predefineLock } from '../../utils/aboutControl'
import BasePlugin from '../BasePlugin'

export default class LockPlugin extends BasePlugin {
  #name: string = 'LockPlugin'
  public editor!: Editor
  constructor() {
    super()
  }
  get name() {
    return this.#name
  }
  async init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
    insertLockRule()
    // 可以在这里替换控制点？
    await FCanvas.addControl('lock', predefineLock)
  }
}
