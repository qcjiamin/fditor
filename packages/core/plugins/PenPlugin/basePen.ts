// 三角形起始点和终点是2个点，只是值完全相同，移动一个点时，与其相同的点全部要一起移动，以此实现节点的变化
// 拖动点，要实现吸附效果成为必然，它能保证点的值相同
// 钢笔状态下，hover的点从最后一个找。 绘制控制点时从最后一个开始绘制。因为hover和selected都挂载最后的点上，如果从前往后，控制点绘制时去重会使状态绘制不出来
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

  pointRadius = 10
  pointStrokeWidth = 2
  pointStroke = 'rgba(59, 130, 246, 0.50)'
  pointFill = 'rgba(255, 255, 255, 1)'
  pointHoverStroke = 'rgba(255, 255, 255, 1)'
  pointHoverFill = 'rgba(59, 130, 246, 0.30)'
  pointSelectStroke = 'rgba(255, 255, 255, 1)'
  pointSelectFill = 'rgba(59, 130, 246, 1)'
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
  _addPoint(point: Point, fake: boolean = false, select: boolean = false) {
    this._points.push({
      type: this.state,
      point,
      fake,
      hover: false,
      selected: select
    })
    if (!fake) {
      this.state = 'line'
    }
    // 所有操作最终都会添加点，将重新绘制的触发逻辑放到这里
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
  /**
   * 检查一个点是否处于某一个控制点附近
   * @param point
   * @returns
   */
  isOverPoint(point: Point) {
    for (let i = this._points.length - 1; i >= 0; i--) {
      if (this._points[i].fake) continue
      const { point: p } = this._points[i]
      if (p.distanceFrom(point) < this.pointRadius + 2) {
        return this._points[i]
      }
    }
    return null
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

    // 绘制控制点
    // 再遍历一遍，给每个点绘制圆形控制点
    ctx.lineWidth = this.pointStrokeWidth
    // ctx.lineCap = decl.strokeLineCap
    // ctx.lineDashOffset = decl.strokeDashOffset
    // ctx.lineJoin = decl.strokeLineJoin
    // ctx.miterLimit = decl.strokeMiterLimit

    ctx.strokeStyle = this.pointStroke
    ctx.fillStyle = this.pointFill

    // 优先画移动点，因为hover状态的点要在移动点之上
    const fakePoint = this._points[this._points.length - 1]
    if (fakePoint.fake) {
      const { point } = fakePoint
      ctx.beginPath()
      ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2)
      ctx.stroke()
    }

    //! 节点只用画一遍，去重。从后往前画！
    const haveDrawNodes: Point[] = []

    for (let i = this._points.length - 1; i >= 0; i--) {
      const { point, fake, hover, selected } = this._points[i]

      // 如果最后一个点是移动点，不用再画，前面已经画过了
      if (i === this._points.length - 1) {
        if (fake) continue
      }
      if (haveDrawNodes.includes(point)) continue
      if (hover) {
        ctx.save()
        ctx.fillStyle = this.pointHoverFill
        ctx.strokeStyle = this.pointHoverStroke
        ctx.beginPath()
        ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      } else if (selected) {
        ctx.save()
        ctx.fillStyle = this.pointSelectFill
        ctx.strokeStyle = this.pointSelectStroke
        ctx.beginPath()
        ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
      haveDrawNodes.push(point)
    }
    ctx.restore()
    console.log('render pen')
  }

  clearSelcted() {
    this._points.forEach((point) => {
      point.selected = false
    })
  }
  clearHover() {
    const realPoint = this._points.filter((point) => !point.fake)
    realPoint.forEach((point) => {
      point.hover = false
    })
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

    const hoverPenPoint = this.isOverPoint(pointer)
    if (hoverPenPoint) {
      // 如果本身是move状态，点到一个存在的点上, 状态修改为line 添加点, 然后选中该点
      if (this.state === 'move') {
        this._addPoint(hoverPenPoint.point, false, true)
        this.state = 'line'
        // hoverPenPoint.selected = true
      } else if (this.state === 'line') {
        // 如果只有一个点，且点击在其范围内，什么都不做
        if (this._points.length === 1) return
        // 如果有多个点，点在最后一个点范围内，什么都不做
        if (this._points.length > 1 && hoverPenPoint === this._points[this._points.length - 1]) {
          return
        }
        this.clearSelcted()
        //! 其他情况，添加一个与hover相同的点， 然后变为move状态
        this._addPoint(hoverPenPoint.point)
        this.state = 'move'
      }
    } else {
      this.clearSelcted()
      this._addPoint(pointer, false, true)
    }
  }
  // 暂时先复用 TBrushEventData， 后续根据具体需求改进
  onMouseMove(pointer: Point, { e }: TBrushEventData) {
    if (!this.canvas._isMainEvent(e)) {
      return
    }
    // 检测当前点是否在存在的点附近
    const realPoint = this._points.filter((point) => !point.fake)
    realPoint.forEach((point) => {
      point.hover = false
    })
    const hoverPenPoint = this.isOverPoint(pointer)
    if (hoverPenPoint) {
      hoverPenPoint.hover = true
    }

    // 移除上一个点
    if (this._points.length > 0) {
      if (this._points[this._points.length - 1].fake) {
        this._points.pop()
      }
    }
    // 吸附效果
    if (hoverPenPoint) {
      this._addPoint(hoverPenPoint.point, true)
    } else {
      this._addPoint(pointer, true)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(pointer: Point, { e }: TBrushEventData) {
    console.log('mouseup in pen mode')
  }
  //todo 样式设置
}
