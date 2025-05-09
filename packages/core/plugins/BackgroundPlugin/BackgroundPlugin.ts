//? 是否应该将背景单独放置在一个底层 layer 上
import type { IPlugin } from '../../interface'
import type Editor from '../../Editor'
import { layoutDimensions } from '../../types'
import './methods'
import { BG_COLOR } from '../../utils/constant'

export default class BackgroundPlugin implements IPlugin {
  #name: string = 'BackgroundPlugin'
  public editor!: Editor
  // public bgColor!: Konva.Shape
  constructor() {}
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    // const dimensions = layoutDimensions[this.editor.layout]
    // this.bgColor = new Konva.Rect({
    //   x: 0,
    //   y: 0,
    //   width: dimensions.width,
    //   height: dimensions.height,
    //   fill: BG_COLOR,
    //   draggable: false,
    //   listening: false,
    //   id: 'extra-bgColor'
    // })
    // this.editor.mainLayer.add(this.bgColor)
    // this.bgColor.moveToBottom()
    this.editor.emit('plugin:installed', this)

    this.editor.on('layout:change', () => {
      console.log('on layout:change')
      // const dimensions = layoutDimensions[this.editor.layout]
      // this.bgColor.width(dimensions.width)
      // this.bgColor.height(dimensions.height)
    })
    this.editor.on('node:zindex:change', () => {
      // this.bgColor.moveToBottom()
    })
  }
  // public setBackgroundColor(color: string) {
  //   // this.bgColor.fill(color)
  //   // this.editor.mainLayer.draw()
  // }
  public getBackgroundColor() {
    // return this.bgColor.fill()
  }
}
