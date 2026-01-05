// 实现方案
// 1. 基于points->segments->path->渲染
// 2. 处理路径对象变换后，与points的映射问题：在进入选择工具状态时，将points应用对象的变换
// 3. 继承FPath的mr等控制点方法，导致path与points分离的问题：重写FPenPath的4个中心点的控制方法[直接对所有点应用缩放倍数，然后由wrapWithFixedAnchor校正锚点位置，
//   用mr举例，1-2 放大3倍变为 3-6，然后将left 3 移回 1 的位置]
// 方案问题
// 1. 每次进入选择工具后，退出都是创建的新的对象，会丢失旋转的角度

// 其它方案
// points从创建后就不变[同时也必须记录pathoffset]，渲染时计算变换矩阵，生成新的path进行渲染。
// 类似isOverPoint 这样的判定，也都需要将所有点应用对象的变换矩阵后，再与鼠标点进行判定。
// 方案问题
// 1. 计算非常繁琐
// 2. 需要频繁计算变换矩阵，性能未知

// 利用fabric原生control的方案
// 1. 可以在选择工具状态下复用元素的渲染逻辑
// 2. 是否能实现贝塞尔手柄控制点？

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Point, util } from 'fabric'
import BasePen from './basePen'
import { penPoint } from './type'
import { BaseSubPen } from './baseSubPen'
import { subPenType } from '@fditor/core'
import { pathToFaces } from '../../utils/aboutPath'
import { segmentsToPath } from '../../utils/penHelper'

// todo: 拖拽放置到存在的点时，合并点

export default class SubSelect extends BaseSubPen {
  type: subPenType = 'select'
  dragPoint: penPoint | null = null
  startPoint: Point | null = null

  constructor(pen: BasePen) {
    super(pen)
  }

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
    this._render(pen)
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

  _renderFill(pen: BasePen): void {
    const ctx = pen.canvas.contextTop
    // 绘制填充
    if (!pen.fill) {
      return
    }

    ctx.save()
    // todo: 支持渐变和图案填充
    ctx.fillStyle = pen.fill
    const pathstr = segmentsToPath(pen.segments, pen.points)
    const path = util.makePathSimpler(util.parsePath(pathstr))
    const inner = pathToFaces(path)
    // 与FPenPath绘制填充一致，不同的是不需要转换为对象坐标系
    for (const face of inner) {
      ctx.beginPath()

      const startPoint = new Point(face.points[0].x, face.points[0].y)
      ctx.moveTo(startPoint.x, startPoint.y)
      for (let i = 1; i < face.points.length; i++) {
        const point = new Point(face.points[i].x, face.points[i].y)
        ctx.lineTo(point.x, point.y)
      }
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  _render(pen: BasePen): void {
    const ctx = pen.canvas.contextTop
    // 绘制钢笔路线
    pen.canvas.clearContext(ctx)
    pen._saveAndTransform(ctx)
    // 绘制填充
    this._renderFill(pen)

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
  }
}
