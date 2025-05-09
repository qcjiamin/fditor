import { Text, TextConfig } from 'konva/lib/shapes/Text'

class TextBox extends Text {
  constructor(config: TextConfig) {
    super(config)
    this.className = 'TextBox'
    // this.on('custom:transform', function (info) {
    //   // 需要知道当前是哪个control导致的变换
    //   console.log(info)
    //   //todo: 这里事件参数类型不安全，待优化
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   const transformer = (info as any).transformer as Transformer
    //   console.log(transformer.getActiveAnchor())
    //   const anchor = transformer.getActiveAnchor()
    //   if (anchor === 'middle-left' || anchor === 'middle-right') {
    //     this.setAttrs({
    //       width: this.width() * this.scaleX(),
    //       scaleX: 1
    //     })
    //   }
    // })
  }
}

export default TextBox
