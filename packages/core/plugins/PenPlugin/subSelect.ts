/* eslint-disable @typescript-eslint/no-unused-vars */
import { Point } from 'fabric'
import BasePen from './basePen'
import { ISubPen, penPoint, subPenType } from './type'

export default class SubSelect implements ISubPen {
  type: subPenType = 'select'
  dragPoint: penPoint | null = null
  startPoint: Point | null = null

  color = 'rgba(0, 0, 0, 1)'
  width = 2
  strokeLineCap: CanvasLineCap = 'round'
  strokeLineJoin: CanvasLineJoin = 'round'
  strokeMiterLimit = 10

  pointRadius = 10
  pointStrokeWidth = 2
  pointStroke = 'rgba(59, 130, 246, 0.50)'
  pointFill = 'rgba(255, 255, 255, 1)'
  pointHoverStroke = 'rgba(255, 255, 255, 1)'
  pointHoverFill = 'rgba(59, 130, 246, 0.30)'
  pointSelectStroke = 'rgba(255, 255, 255, 1)'
  pointSelectFill = 'rgba(59, 130, 246, 1)'

  onMouseDown(pen: BasePen, point: Point): void {
    // 是否点在控制点
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      this.startPoint = point
      this.dragPoint = hoverPenPoint
    }
  }
  onMouseMove(pen: BasePen, point: Point): void {
    if (this.dragPoint && this.startPoint) {
      // 按照 startPoint 与当前鼠标位置，计算移动的距离
      const deltaX = point.x - this.startPoint.x
      const deltaY = point.y - this.startPoint.y
      this.dragPoint.x += deltaX
      this.dragPoint.y += deltaY
      this.startPoint = new Point(this.dragPoint.x, this.dragPoint.y)
      this._render(pen)
      return
    }
    // 添加hover状态
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      hoverPenPoint.hover = true
    }
  }
  onMouseUp(pen: BasePen, point: Point): void {
    this.dragPoint = null
    this.startPoint = null
  }
  enter(pen: BasePen): void {}
  exit(pen: BasePen): void {}

  _setStyles(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.width
    ctx.lineCap = this.strokeLineCap
    ctx.miterLimit = this.strokeMiterLimit
    ctx.lineJoin = this.strokeLineJoin
    // ctx.setLineDash(this.strokeDashArray || [])
  }
  _render(pen: BasePen): void {
    const ctx = pen.canvas.contextTop
    // 绘制钢笔路线
    pen.canvas.clearContext(ctx)
    pen._saveAndTransform(ctx)

    this._setStyles(pen.canvas.contextTop)
    // 画线段
    // 设置样式
    // this._setStyles(ctx)
    let lastPointId = ''
    ctx.beginPath()
    for (let i = 0; i < pen.segments.length; i++) {
      const { from, to } = pen.segments[i]
      const fromPoint = pen.points.find((point) => point.id === from) as penPoint
      const toPoint = pen.points.find((point) => point.id === to) as penPoint
      if (lastPointId === fromPoint.id) {
        ctx.lineTo(toPoint.x, toPoint.y)
      } else {
        ctx.moveTo(fromPoint.x, fromPoint.y)
        ctx.lineTo(toPoint.x, toPoint.y)
      }
      lastPointId = toPoint.id
    }
    ctx.stroke()

    // 画控制点
    // 再遍历一遍，给每个点绘制圆形控制点
    ctx.lineWidth = this.pointStrokeWidth
    // ctx.lineCap = decl.strokeLineCap
    // ctx.lineDashOffset = decl.strokeDashOffset
    // ctx.lineJoin = decl.strokeLineJoin
    // ctx.miterLimit = decl.strokeMiterLimit

    ctx.strokeStyle = this.pointStroke
    ctx.fillStyle = this.pointFill

    const anchorPoints = pen.points.filter((point) => point.role === 'anchor')
    for (let i = 0; i <= anchorPoints.length - 1; i++) {
      const { x, y, hover, selected } = anchorPoints[i]

      if (hover) {
        ctx.save()
        ctx.fillStyle = this.pointHoverFill
        ctx.strokeStyle = this.pointHoverStroke
        ctx.beginPath()
        ctx.arc(x, y, this.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      } else if (selected) {
        ctx.save()
        ctx.fillStyle = this.pointSelectFill
        ctx.strokeStyle = this.pointSelectStroke
        ctx.beginPath()
        ctx.arc(x, y, this.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, this.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
    ctx.restore()
    console.log('render pen')
  }
}
