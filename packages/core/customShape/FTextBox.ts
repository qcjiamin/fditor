import { classRegistry, Textbox } from 'fabric'

export class FTextBox extends Textbox {
  public static type = 'ftextbox'
  constructor(text: ConstructorParameters<typeof Textbox>[0], options?: ConstructorParameters<typeof Textbox>[1]) {
    super(text, options)
    // 文字隐藏上下控制点
    this.setControlVisible('mt', false)
    this.setControlVisible('mb', false)
  }
  /**
   * ui显示的文字大小为 fontsize * scaleX
   * @returns
   */
  getUiFontSize() {
    return Math.round(this.scaleX * this.fontSize)
  }
  setUIFontSize(size: number) {
    const toScale = size / this.fontSize
    this.eset({
      scaleX: toScale,
      scaleY: toScale
    })
  }
}

classRegistry.setClass(FTextBox, 'ftextbox')
classRegistry.setSVGClass(FTextBox, 'ftextbox')
