import { classRegistry, Textbox } from 'fabric'
import { isFiller, isPattern } from '../utils/typeAssertions'
import { createLinearGradient, createRadialGradient, type LinearGradient, type RadialGradient } from '@fditor/core'

export class FTextBox extends Textbox {
  public static type = 'ftextbox'
  constructor(text: ConstructorParameters<typeof Textbox>[0], options?: ConstructorParameters<typeof Textbox>[1]) {
    super(text, options)
    // 文字隐藏上下控制点
    this.setControlVisible('mt', false)
    this.setControlVisible('mb', false)

    // 文字修改时动态修改渐变色
    this.on('changed', () => {
      this.resetGradient()
    })
    this.on('resizing', () => {
      this.resetGradient()
    })
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
  resetGradient() {
    if (!isFiller(this.fill)) return
    if (isPattern(this.fill)) return
    const colors = this.fill.colorStops.map((stop) => stop.color)
    if (this.fill.type === 'linear') {
      const fill = this.fill as LinearGradient
      // const { x1, y1, x2, y2 } = this.fill.coords
      // const degree = getAngleFromTwoPoints(x1, y1, x2, y2)
      const degree = fill._degree
      const autoGradient = createLinearGradient('pixels', degree, this.width, this.height, ...colors)
      this.set('fill', autoGradient)
    } else if (this.fill.type === 'radial') {
      const fill = this.fill as RadialGradient
      const percent = fill._percent
      const autoGradient = createRadialGradient('pixels', percent, this.width, this.height, ...colors)
      this.set('fill', autoGradient)
    }
    if (this.canvas) this.canvas.requestRenderAll()
  }
}

classRegistry.setClass(FTextBox, 'ftextbox')
classRegistry.setSVGClass(FTextBox, 'ftextbox')
