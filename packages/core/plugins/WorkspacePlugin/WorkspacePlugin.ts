import './methods'
import type { IPlugin } from '../../types'
import Editor from '../../Editor'
import { Rect } from 'fabric'

export default class WorkspacePlugin implements IPlugin {
  #name: string = 'WorkspacePlugin'
  public editor!: Editor
  public clipBox!: Rect
  constructor() {}
  get name() {
    return this.#name
  }
  init(editor: Editor): void {
    this.editor = editor
    // 创建并添加ClipPath
    this.clipBox = new Rect({
      width: this.editor.workspace.width,
      height: this.editor.workspace.height
    })
    this.editor.stage.clipPath = this.clipBox

    // 监听 resize 事件
    this.bindResizeEvent()
    this.editor.emit('plugin:installed', this)
  }
  bindResizeEvent() {
    this.editor.on('workspace:resize', () => {
      this.clipBox.width = this.editor.workspace.width
      this.clipBox.height = this.editor.workspace.height
      this.editor.moveViewportToWorkspaceCenter(this.editor.workspace)
    })
  }
}
