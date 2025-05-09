// import Editor from '../../Editor'
import { Editor } from '@kditor/core'
import type { IPlugin } from '../../types'
import './methods.ts'
import Konva from 'konva'

// 颜色获取与设置插件
// 由于渐变色的原因，颜色相关逻辑比较复杂，这里直接封装为一个插件
export default class ColorPlugin implements IPlugin {
  #name: string = 'ColorPlugin'
  public editor!: Editor
  constructor() {}
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
  }
  getFill() {
    const shape = this.editor.getActiveShape() as Konva.Shape
    return shape.fill()
  }
  setFill(val: string) {
    const shape = this.editor.getActiveShape() as Konva.Shape
    shape.fill(val)
  }
}
