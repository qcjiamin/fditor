import { Canvas, TPointerEvent } from 'fabric'
import BasePen from './basePen'
import { Editor } from '@fditor/core'
import { penPoint } from './type'
import { FPenPath } from '../../customShape/FPenPath'
declare module 'fabric' {
  export interface Canvas {
    pen: BasePen | undefined
    _onMouseDownInPenMode(e: TPointerEvent): void
    _onMouseMoveInPenMode(e: TPointerEvent): void
    _onMouseUpInPenMode(e: TPointerEvent): void
  }
}

Canvas.prototype._onMouseDownInPenMode = function (e: TPointerEvent) {
  if (this.pen) {
    const pointer = this.getScenePoint(e)
    this.pen.onMouseDown(pointer, { e, pointer })
  }
  // this.setCursor(this.freeDrawingCursor)
  this._handleEvent(e, 'down', { alreadySelected: false })
}

Canvas.prototype._onMouseMoveInPenMode = function (e: TPointerEvent) {
  if (this.pen) {
    const pointer = this.getScenePoint(e)
    this.pen.onMouseMove(pointer, { e, pointer })
  }
  // this.setCursor(this.freeDrawingCursor)
  this._handleEvent(e, 'move')
}

Canvas.prototype._onMouseUpInPenMode = function (e: TPointerEvent) {
  if (this.pen) {
    const pointer = this.getScenePoint(e)
    this.pen.onMouseUp(pointer, { e, pointer })
  }
  //? mouseup会触发renderAll[引导线会监听mouse:up,执行renderAll], 会清空顶层画布，这里先注释掉
  // this._handleEvent(e, 'up')
}
/** penPoints 转换为 pathstr */
function penPointsToPath(points: penPoint[]) {
  let path = ''
  for (let i = 0; i < points.length; i++) {
    const { type, point } = points[i]
    if (type === 'move') {
      path += `M${point.x},${point.y}`
    } else if (type === 'line') {
      path += `L${point.x},${point.y}`
    }
  }
  return path
}

const originMouseDown = Canvas.prototype.__onMouseDown
Canvas.prototype.__onMouseDown = function (e: TPointerEvent) {
  if (this.pen) {
    this._onMouseDownInPenMode(e)
    return
  } else {
    originMouseDown.call(this, e)
  }
}
const originMouseMove = Canvas.prototype.__onMouseMove
Canvas.prototype.__onMouseMove = function (e: TPointerEvent) {
  if (this.pen) {
    this._onMouseMoveInPenMode(e)
    return
  } else {
    originMouseMove.call(this, e)
  }
}
const originMouseUp = Canvas.prototype.__onMouseUp
Canvas.prototype.__onMouseUp = function (e: TPointerEvent) {
  if (this.pen) {
    this._onMouseUpInPenMode(e)
    return
  } else {
    console.log('upupup')
    originMouseUp.call(this, e)
  }
}

declare module '@fditor/core' {
  interface Editor {
    enterPenMode(): void
    leavePenMode(): void
  }
}

Editor.prototype.enterPenMode = function () {
  this.stage.pen = new BasePen(this.stage)
}

Editor.prototype.leavePenMode = function () {
  if (!this.stage.pen) return

  const pen = this.stage.pen
  this.stage.pen = undefined
  // 添加path到画布
  const penPoints = pen._points.filter((point) => !point.fake)
  if (penPoints.length > 1) {
    const pathstr = penPointsToPath(penPoints)
    const path = new FPenPath(pathstr, {
      radiusAble: true,
      fill: null,
      stroke: pen.color,
      strokeWidth: pen.width,
      strokeLineCap: pen.strokeLineCap,
      strokeLineJoin: pen.strokeLineJoin,
      strokeMiterLimit: pen.strokeMiterLimit
    })
    this.add(path)
  }
}
