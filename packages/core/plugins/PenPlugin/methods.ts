// todo: 支持触摸事件，参考 fabric.js 中的实现
import { Canvas, TPointerEvent, util } from 'fabric'
import BasePen from './basePen'
import { Editor } from '@fditor/core'
import { penPoint, penSegment } from './type'
import { FPenPath } from '../../customShape/FPenPath'
import { isFCanvas } from '../../utils/tsHelper'
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

function segmentsToPath(segments: penSegment[], points: penPoint[]) {
  let path = ''
  let lastEndPointId: string = ''
  console.log(segments, points)
  for (let i = 0; i < segments.length; i++) {
    const { type, from, to } = segments[i]
    const fromPoint = points.find((point) => point.id === from) as penPoint
    const toPoint = points.find((point) => point.id === to) as penPoint
    if (!fromPoint || !toPoint) {
      throw new Error('segmentsToPath: fromPoint or toPoint is null')
    }
    if (type === 'line') {
      const isClose = toPoint.type === 'move'
      if (lastEndPointId === fromPoint.id) {
        if (isClose) {
          path += 'Z'
        } else {
          path += `L${toPoint.x},${toPoint.y}`
        }
      } else {
        path += `M${fromPoint.x},${fromPoint.y}`
        path += `L${toPoint.x},${toPoint.y}`
      }
      lastEndPointId = toPoint.id
    }
  }
  return path
}

const originMouseDown = Canvas.prototype.__onMouseDown
Canvas.prototype.__onMouseDown = function (e: TPointerEvent) {
  if (this.pen) {
    this._onMouseDownInPenMode(e)
    this._resetTransformEventData()
    return
  } else {
    originMouseDown.call(this, e)
  }
}
const originMouseMove = Canvas.prototype.__onMouseMove
Canvas.prototype.__onMouseMove = function (e: TPointerEvent) {
  if (this.pen) {
    this._onMouseMoveInPenMode(e)
    //! 重要，originMouseMove 后一定会调用的方法，这里也需要手动调用
    this._resetTransformEventData()
    return
  } else {
    originMouseMove.call(this, e)
  }
}
const originMouseUp = Canvas.prototype.__onMouseUp
Canvas.prototype.__onMouseUp = function (e: TPointerEvent) {
  if (this.pen) {
    this._onMouseUpInPenMode(e)
    this._resetTransformEventData()
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
    enterPenSelectMode(): void
    leavePenSelectMode(): void
  }
}

Editor.prototype.enterPenMode = function () {
  this.emit('enter:penMode', undefined)
  this.stage.discardActiveObject()
  this.stage.renderAll()
  this.stage.pen = new BasePen(this.stage, 'pen')
}

Editor.prototype.leavePenMode = function () {
  if (!this.stage.pen) return

  const pen = this.stage.pen
  this.stage.setCursor('default')
  this.stage.pen = undefined
  // 添加path到画布
  if (pen.segments.length > 0) {
    const pathstr = segmentsToPath(pen.segments, pen.points)
    const path = new FPenPath(pathstr, {
      radiusAble: true,
      fill: null,
      stroke: pen.color,
      strokeWidth: pen.width,
      strokeLineCap: pen.strokeLineCap,
      strokeLineJoin: pen.strokeLineJoin,
      strokeMiterLimit: pen.strokeMiterLimit,
      points: pen.points,
      segments: pen.segments
    })
    this.add(path)
  }
  this.emit('exit:penMode', undefined)
}

declare module '@fditor/core' {
  interface FPenPath {
    enterSelectMode(): void
  }
}

FPenPath.prototype.enterSelectMode = function () {
  console.log('enterSelectMode')
  if (!this.canvas) {
    throw Error('enterSelectMode: no canvas')
  }
  if (!isFCanvas(this.canvas)) {
    return
  }
  // 恢复鼠标样式
  this.canvas.setCursor('default')
  const style = {
    stroke: this.stroke as string,
    strokeWidth: this.strokeWidth as number
  }

  const pen = new BasePen(this.canvas, 'select', style, this.calcOwnMatrix(), this.pathOffset)
  pen.points = this.points
  pen.segments = this.segments
  this.canvas.pen = pen
  this.canvas._removeSelected()
  // 重新绘制topCanvas
  pen.currentSubTool._render(pen)
}
