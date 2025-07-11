import Editor from '../../Editor'
import BasePlugin from '../BasePlugin'

export default class AngleHintPlugin extends BasePlugin {
  #name: string = 'AngleHintPlugin'
  public editor!: Editor
  constructor() {
    super()
  }
  get name() {
    return this.#name
  }
  init(editor: Editor): void {
    this.editor = editor
    // 监听 resize 事件
    this.bindResizeEvent()
    this.editor.emit('plugin:installed', this)
  }
  bindResizeEvent() {}
}
