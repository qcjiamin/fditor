/** 理论上能直接在Editor类上实现这个方法，插件的实现方式可以将这个功能插件化，分配给不同的人实现 */
import { CircleBrush, PatternBrush, PencilBrush, SprayBrush } from 'fabric'
import Editor from '../../Editor'
import { BrushConstructor } from './type'
import { brushType } from '@fditor/core'

declare module '@fditor/core' {
  interface Editor {
    enterPencilMode(lastBrush?: brushType): void
    leavePencilMode(): void
    switchBrush(brushType: brushType): void
  }
}

// brushType 对应一个brush的构造函数
const brushConstructorMap: Record<brushType, BrushConstructor> = {
  pencil: PencilBrush,
  circle: CircleBrush,
  spray: SprayBrush,
  pattern: PatternBrush
}

Editor.prototype.enterPencilMode = function (lastBrush?: brushType) {
  this.stage.isDrawingMode = true
  const initBrushType = lastBrush || 'pencil'
  const initBrush = new brushConstructorMap[initBrushType](this.stage)
  this.stage.freeDrawingBrush = initBrush
  this.emit('enter:pencilMode', undefined)
}

Editor.prototype.leavePencilMode = function () {
  this.stage.isDrawingMode = false
  this.stage.freeDrawingBrush = undefined
  this.stage.setCursor('default')
  this.emit('exit:pencilMode', undefined)
}

Editor.prototype.switchBrush = function (brushType: brushType) {
  this.leavePencilMode()
  this.enterPencilMode(brushType)
}
