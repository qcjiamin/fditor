import { Canvas, Point, TBrushEventData } from 'fabric'
import type { penPoint, penState } from './type'
export default class BasePen {
  canvas: Canvas
  _points: penPoint[] = []
  /** 初始状态为move, 因为第一个点一定是move */
  // 变为 line 的条件是添加了一个点
  // 变为 move 的条件是在 line 状态下 esc 一次
  // esc退出的条件是在move状态下，按下 esc
  // 点击的点与最后一个点要做判断，是否在最后一个点的范围内，如果是，拒绝添加
  // 点击的点与除最后一个点之间做判断，如果点在前面的点上，添加move状态的点
  state: penState = 'move'
  color = 'rgba(0, 0, 0, 1)'
  width = 2
  strokeLineCap: CanvasLineCap = 'round'
  strokeLineJoin: CanvasLineJoin = 'round'
  strokeMiterLimit = 10
  constructor(canvas: Canvas) {
    this.canvas = canvas
    this._setStyles(this.canvas.contextTop)
  }
  protected _saveAndTransform(ctx: CanvasRenderingContext2D) {
    const v = this.canvas.viewportTransform
    ctx.save()
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
  }
  _setStyles(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.width
    ctx.lineCap = this.strokeLineCap
    ctx.miterLimit = this.strokeMiterLimit
    ctx.lineJoin = this.strokeLineJoin
    // ctx.setLineDash(this.strokeDashArray || [])
  }
  /**
   *
   * @param point
   * @param fake 表示当前添加的点是否为鼠标移动模拟的
   * @returns
   */
  _addPoint(point: Point, fake: boolean = false) {
    this._points.push({
      type: this.state,
      point,
      fake
    })
    if (!fake) {
      this.state = 'line'
    }
    // 所有才做最终都会添加点，将重新绘制的触发逻辑放到这里
    this._render()
    return true
  }
  esc() {
    // 移除最后一个点
    const lastPoint = this._points[this._points.length - 1]
    if (this._points.length > 0) {
      this._points.pop()
    }
    if (this.state === 'move') {
      this.canvas.pen = undefined
    } else if (this.state === 'line') {
      this.state = 'move'
      if (lastPoint) {
        this._addPoint(lastPoint.point)
      }
    }
  }
  _render(ctx: CanvasRenderingContext2D = this.canvas.contextTop) {
    // 绘制钢笔路线
    this.canvas.clearContext(ctx)
    this._saveAndTransform(ctx)
    // 设置样式
    // this._setStyles(ctx)

    ctx.beginPath()
    for (let i = 0; i < this._points.length; i++) {
      const { type, point } = this._points[i]
      if (type === 'move') ctx.moveTo(point.x, point.y)
      else if (type === 'line') ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()

    // 再遍历一遍，给每个点绘制圆形控制点
    ctx.strokeStyle = '#3b82f680'
    for (let i = 0; i < this._points.length; i++) {
      const { point } = this._points[i]
      console.log('render control', point)
      ctx.beginPath()
      ctx.arc(point.x, point.y, 10, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
    console.log('render pen')
  }
  onMouseDown(pointer: Point, { e }: TBrushEventData) {
    if (!this.canvas._isMainEvent(e)) {
      return
    }
    // 先移除fake点
    if (this._points.length > 0) {
      if (this._points[this._points.length - 1].fake) {
        this._points.pop()
      }
    }
    this._addPoint(pointer)
  }
  // 暂时先复用 TBrushEventData， 后续根据具体需求改进
  onMouseMove(pointer: Point, { e }: TBrushEventData) {
    if (!this.canvas._isMainEvent(e)) {
      return
    }
    // 移除上一个点
    if (this._points.length > 0) {
      if (this._points[this._points.length - 1].fake) {
        this._points.pop()
      }
    }
    this._addPoint(pointer, true)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(pointer: Point, { e }: TBrushEventData) {
    console.log('mouseup in pen mode')
  }
  //todo 样式设置
}
