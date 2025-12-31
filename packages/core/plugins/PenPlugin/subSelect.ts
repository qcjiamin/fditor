/* eslint-disable @typescript-eslint/no-unused-vars */
import { Point } from 'fabric'
import BasePen from './basePen'
import { penPoint } from './type'
import { BaseSubPen } from './baseSubPen'
import { subPenType } from '@fditor/core'

// todo: 拖拽放置到存在的点时，合并点

export default class SubSelect extends BaseSubPen {
  type: subPenType = 'select'
  dragPoint: penPoint | null = null
  startPoint: Point | null = null

  onMouseDown(pen: BasePen, point: Point): void {
    pen.clearSelcted()
    // 是否点在控制点
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      this.startPoint = point
      this.dragPoint = hoverPenPoint
      hoverPenPoint.selected = true
    }
    this._render(pen)
  }
  onMouseMove(pen: BasePen, point: Point): void {
    pen.clearHover()

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
  enter(pen: BasePen): void {
    super.enter(pen)
    this._render(pen)
  }
  exit(pen: BasePen): void {}

  _render(pen: BasePen): void {
    const ctx = pen.canvas.contextTop
    // 绘制钢笔路线
    pen.canvas.clearContext(ctx)
    pen._saveAndTransform(ctx)

    ctx.strokeStyle = pen.color
    ctx.lineWidth = pen.width
    ctx.lineCap = pen.strokeLineCap
    ctx.miterLimit = pen.strokeMiterLimit
    ctx.lineJoin = pen.strokeLineJoin
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
    ctx.lineWidth = pen.pointStrokeWidth
    // ctx.lineCap = decl.strokeLineCap
    // ctx.lineDashOffset = decl.strokeDashOffset
    // ctx.lineJoin = decl.strokeLineJoin
    // ctx.miterLimit = decl.strokeMiterLimit

    ctx.strokeStyle = pen.pointStroke
    ctx.fillStyle = pen.pointFill

    const anchorPoints = pen.points.filter((point) => point.role === 'anchor')
    for (let i = 0; i <= anchorPoints.length - 1; i++) {
      const { x, y, hover, selected } = anchorPoints[i]

      if (hover) {
        ctx.save()
        ctx.fillStyle = pen.pointHoverFill
        ctx.strokeStyle = pen.pointHoverStroke
        ctx.beginPath()
        ctx.arc(x, y, pen.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      } else if (selected) {
        ctx.save()
        ctx.fillStyle = pen.pointSelectFill
        ctx.strokeStyle = pen.pointSelectStroke
        ctx.beginPath()
        ctx.arc(x, y, pen.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, pen.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
    ctx.restore()
    console.log('render pen')
  }
}
