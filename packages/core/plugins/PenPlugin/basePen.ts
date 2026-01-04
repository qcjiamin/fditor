// 三角形起始点和终点是2个点，只是值完全相同，移动一个点时，与其相同的点全部要一起移动，以此实现节点的变化
// 拖动点，要实现吸附效果成为必然，它能保证点的值相同
// 钢笔状态下，hover的点从最后一个找。 绘制控制点时从最后一个开始绘制。因为hover和selected都挂载最后的点上，如果从前往后，控制点绘制时去重会使状态绘制不出来
import { Canvas, Point, TBrushEventData, TMat2D } from 'fabric'
import type { penPoint, penSegment } from './type'
import { BaseSubPen } from './baseSubPen'
import SubPen from './subPen'
import SubSelect from './subSelect'
import SubCurve from './subCurve'
import { subPenType } from '@fditor/core'
export default class BasePen {
  #color: string = 'rgba(0, 0, 0, 1)'
  #width: number = 2
  currentSubTool: BaseSubPen
  canvas: Canvas
  points: penPoint[] = []
  segments: penSegment[] = []
  subtypes: Record<subPenType, BaseSubPen>
  objectTransformMatrix: TMat2D | null = null

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

  constructor(
    canvas: Canvas,
    subType: subPenType = 'pen',
    style?: { stroke: string; strokeWidth: number },
    objectTransformMatrix?: TMat2D
  ) {
    this.canvas = canvas
    if (objectTransformMatrix) {
      this.objectTransformMatrix = objectTransformMatrix
    }
    // 初始化所有状态（依赖注入）
    this.subtypes = {
      pen: new SubPen(),
      select: new SubSelect(),
      curve: new SubCurve()
    }
    this.currentSubTool = this.subtypes[subType]

    if (style) {
      this.color = style.stroke
      this.width = style.strokeWidth
    }

    this.currentSubTool.enter(this)
  }
  get color() {
    return this.#color
  }
  set color(val: string) {
    if (this.#color === val) return
    this.#color = val
    this.currentSubTool._render(this)
  }
  get width() {
    return this.#width
  }
  set width(val: number) {
    if (this.#width === val) return
    this.#width = val
    this.currentSubTool._render(this)
  }
  /** 矩阵变换 */
  _saveAndTransform(ctx: CanvasRenderingContext2D) {
    const v = this.canvas.viewportTransform
    ctx.save()
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
  }
  get anchorPoints() {
    return this.points.filter((point) => point.role === 'anchor')
  }

  switchSubtype(type: subPenType) {
    if (this.currentSubTool.type === type) return // 避免重复切换
    // 退出当前状态 → 切换新状态 → 进入新状态
    this.currentSubTool.exit(this)
    this.currentSubTool = this.subtypes[type]
    this.currentSubTool.enter(this)
  }

  esc() {
    // // 移除最后一个点
    // const lastPoint = this.points[this.points.length - 1]
    // if (this.points.length > 0) {
    //   this.points.pop()
    // }
    // if (this.state === 'move') {
    //   this.canvas.pen = undefined
    // } else if (this.state === 'line') {
    //   this.state = 'move'
    //   if (lastPoint) {
    //     this._addPoint(lastPoint.point)
    //   }
    // }
  }
  /**
   * 检查一个点是否处于某一个控制点附近
   * @param point
   * @returns
   */
  isOverPoint(point: Point) {
    const anchorPoints = this.anchorPoints
    for (let i = anchorPoints.length - 1; i >= 0; i--) {
      const { x, y } = anchorPoints[i]
      const p = new Point(x, y)
      if (p.distanceFrom(point) < this.pointRadius + 2) {
        return anchorPoints[i]
      }
    }
    return null
  }

  clearSelcted() {
    this.points.forEach((point) => {
      point.selected = false
    })
  }
  clearHover() {
    const anchorPoint = this.points.filter((point) => point.role === 'anchor')
    anchorPoint.forEach((point) => {
      point.hover = false
    })
  }

  onMouseDown(point: Point, { e }: TBrushEventData) {
    if (!this.canvas._isMainEvent(e)) {
      return
    }
    this.currentSubTool.onMouseDown(this, point)
  }
  // 暂时先复用 TBrushEventData， 后续根据具体需求改进
  onMouseMove(point: Point, { e }: TBrushEventData) {
    if (!this.canvas._isMainEvent(e)) {
      return
    }
    this.currentSubTool.onMouseMove(this, point)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(point: Point, { e }: TBrushEventData) {
    console.log('mouseup in pen mode')
    this.currentSubTool.onMouseUp(this, point)
  }
  //todo 样式设置
}
