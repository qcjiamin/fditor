import { Point } from 'fabric'
import BasePen from './basePen'
import { ISubPen } from './type'
import type { penPoint, penState, subPenType } from './type'

/** 初始状态为move, 因为第一个点一定是move */
// 变为 line 的条件是添加了一个点
// 变为 move 的条件是在 line 状态下 esc 一次
// esc退出的条件是在move状态下，按下 esc
// 点击的点与最后一个点要做判断，是否在最后一个点的范围内，如果是，拒绝添加
// 点击的点与除最后一个点之间做判断，如果点在前面的点上，添加move状态的点

export default class SubPen implements ISubPen {
  type: subPenType = 'pen'
  state: penState = 'move'
  /** move时hover的点 */
  hoverPoint: penPoint | null = null
  /** 临时记录中间非第一个move点 */
  mPoint: penPoint | null = null
  /** 记录mouseMove 事件的点 */
  mousePoint: Point | null = null

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
    const hoverPenPoint = this.hoverPoint
    if (hoverPenPoint) {
      // 如果本身是move状态，点到一个存在的点上, 状态修改为line, 记录临时move点
      if (this.state === 'move') {
        this.state = 'line'
        hoverPenPoint.selected = true
        this.mPoint = hoverPenPoint
      } else if (this.state === 'line') {
        // 如果只有一个点，且点击在其范围内，什么都不做
        if (pen.points.length === 1) return
        // 如果有多个点，点在最后一个点范围内，什么都不做
        if (pen.points.length > 1 && hoverPenPoint === pen.points[pen.points.length - 1]) {
          // todo: 点击后拖拽生成贝塞尔手柄和控制点
          return
        }
        pen.clearSelcted()
        //! 其他情况，添加一个与hover相同的点， 然后变为move状态
        // this._addPoint(new Point(hoverPenPoint.x, hoverPenPoint.y))
        // 不加点，加一条线段, 从上一个点到hover点
        const lastPoint = pen.anchorPoints[pen.anchorPoints.length - 1]
        if (!lastPoint) {
          throw new Error('_lastPoint is null')
        }
        const lastPointId = this.mPoint ? this.mPoint.id : lastPoint.id
        pen.segments.push({
          id: window.crypto.randomUUID() as string,
          from: this.mPoint ? this.mPoint.id : lastPointId,
          to: hoverPenPoint.id,
          type: 'line',
          selected: false
        })
        this.state = 'move'
      }
    } else {
      pen.clearSelcted()
      this._addPoint(pen, point, true)
    }
  }
  onMouseMove(pen: BasePen, point: Point): void {
    this.mousePoint = point
    // 检测当前点是否在存在的点附近
    pen.clearHover()
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      hoverPenPoint.hover = true
    }
    this.hoverPoint = hoverPenPoint
    this._render(pen)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(pen: BasePen, point: Point): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enter(pen: BasePen): void {
    // 设置指针样式
    // pen.canvas.contextTop.canvas.style.cursor = 'url(@/assets/pen.png) 5 25, crosshair'
    // pen.currentPath = pen.points // 初始化当前绘制路径
    // 需要做哪些初始化操作
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exit(pen: BasePen): void {}

  _addPoint(pen: BasePen, point: Point, select: boolean = false) {
    let lastPoint = null
    if (this.state === 'line') {
      const anchorPoint = pen.points.filter((point) => point.role === 'anchor')
      if (anchorPoint.length < 1) {
        throw new Error('do not have last anchor point')
      }
      lastPoint = anchorPoint[anchorPoint.length - 1]
    }
    pen.points.push({
      id: window.crypto.randomUUID() as string,
      role: 'anchor',
      type: this.state,
      x: point.x,
      y: point.y,
      hover: false,
      selected: select
    })
    if (this.state === 'line') {
      console.log(this.mPoint)
      pen.segments.push({
        id: window.crypto.randomUUID() as string,
        from: this.mPoint ? this.mPoint.id : lastPoint!.id,
        to: pen.points[pen.points.length - 1].id,
        type: 'line',
        selected: false
      })
      this.mPoint = null
    }
    // 所有操作最终都会添加点，将重新绘制的触发逻辑放到这里
    this.state = 'line'
    this._render(pen)
    return true
  }

  _setStyles(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.width
    ctx.lineCap = this.strokeLineCap
    ctx.miterLimit = this.strokeMiterLimit
    ctx.lineJoin = this.strokeLineJoin
    // ctx.setLineDash(this.strokeDashArray || [])
  }

  _render(pen: BasePen) {
    const ctx = pen.canvas.contextTop
    // 绘制钢笔路线
    pen.canvas.clearContext(ctx)
    pen._saveAndTransform(ctx)

    if (!this.mousePoint) {
      throw new Error('mousePoint is null')
    }
    this._setStyles(pen.canvas.contextTop)
    // 画移动线
    // 先判断是否处于共享顶点的起始状态
    const endPoint = this.mPoint ? this.mPoint : pen.points[pen.points.length - 1]
    if (endPoint && this.state === 'line') {
      ctx.save()
      ctx.strokeStyle = this.pointStroke
      ctx.moveTo(endPoint.x, endPoint.y)
      if (this.hoverPoint) {
        ctx.lineTo(this.hoverPoint.x, this.hoverPoint.y)
      } else {
        ctx.lineTo(this.mousePoint!.x, this.mousePoint!.y)
      }
      ctx.stroke()
      ctx.restore()
    }
    // 画移动圈
    ctx.save()
    ctx.lineWidth = this.pointStrokeWidth
    ctx.strokeStyle = this.pointStroke
    ctx.fillStyle = this.pointFill
    // 优先画移动点，因为hover状态的点要在移动点之上
    ctx.beginPath()
    ctx.arc(this.mousePoint!.x, this.mousePoint!.y, this.pointRadius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

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
