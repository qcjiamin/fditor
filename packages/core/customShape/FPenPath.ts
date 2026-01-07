import { classRegistry, Point } from 'fabric'
import { FPath, FPathProps } from './FPath'
import { objectCommonProperties } from '../utils/constant'
import { penPoint, penSegment } from '../plugins/PenPlugin/type'
import { segmentsToPath } from '../utils/penHelper'
import { wrapWithFireEvent, wrapWithFixedAnchor } from '../helper'
import { switchPointFromLocalToContainer } from '../utils/mat'
import { TMat2D, TPointerEvent, Transform } from 'fabric'
import { pathToFaces } from '../utils/aboutPath'

interface UniqueFPenPathProps {
  points: penPoint[]
  segments: penSegment[]
}
// export interface FPenPathProps extends PathProps, UniqueFPenPathProps {}

export class FPenPath extends FPath {
  static type = 'fpenpath'
  public static customProperties: string[] = [
    ...objectCommonProperties,
    'points',
    'segments',
    'cornerRadius',
    'radiusAble',
    'originPath',
    'originWidth',
    'originHeight'
  ]
  public points: penPoint[]
  public segments: penSegment[]
  /** 记录初始点位，用于缩放计算 */
  public originPoints: penPoint[] = []
  // points 和 segments 必填
  // points 和 segments 必填
  constructor(path: string, options: Partial<FPathProps> & UniqueFPenPathProps) {
    super(path, options)
    this.points = options.points
    this.segments = options.segments
    // 深拷贝一份初始点位
    this.originPoints = JSON.parse(JSON.stringify(this.points))
    this._initResizeControls()
    this.radiusAble = true
  }

  _initResizeControls() {
    this.controls.ml.actionHandler = wrapWithFireEvent(
      'resizing',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, x: number, _y: number) => {
        if (!this.canvas) return false
        const thisMat = this.calcTransformMatrix()
        const mlPoint = new Point(-this.width / 2, 0)
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const mlPointInView = switchPointFromLocalToContainer(thisMat, cvsMat, mlPoint)

        //! 支持缩放(在组内时被组代理会有scale值)
        const offsetWidth = (mlPointInView.x - x) / this.scaleX
        const toScaleX = (this.width + offsetWidth) / this.originWidth
        const toScaleY = this.height / this.originHeight

        if (toScaleX <= 0) return false

        this._updatePointsAndPath(toScaleX, toScaleY)
        this.setCoords()
        return true
      })
    )

    this.controls.mr.actionHandler = wrapWithFireEvent(
      'resizing',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, x: number, _y: number) => {
        if (!this.canvas) return false
        const thisMat = this.calcTransformMatrix()
        const point = new Point(this.width / 2, 0)
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const pointInView = switchPointFromLocalToContainer(thisMat, cvsMat, point)
        const offsetWidth = (x - pointInView.x) / this.scaleX
        const toScaleX = (this.width + offsetWidth) / this.originWidth
        const toScaleY = this.height / this.originHeight
        if (toScaleX <= 0) return false

        this._updatePointsAndPath(toScaleX, toScaleY)
        this.setCoords()
        return true
      })
    )

    this.controls.mt.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, _x: number, y: number) => {
        if (!this.canvas) return false
        const thisMat = this.calcTransformMatrix()
        const point = new Point(0, -this.height / 2)
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const pointInView = switchPointFromLocalToContainer(thisMat, cvsMat, point)
        const offsetHeight = (pointInView.y - y) / this.scaleY
        const toScaleY = (this.height + offsetHeight) / this.originHeight
        const toScaleX = this.width / this.originWidth
        if (toScaleY <= 0) return false

        this._updatePointsAndPath(toScaleX, toScaleY)
        this.setCoords()
        return true
      })
    )

    this.controls.mb.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, _x: number, y: number) => {
        if (!this.canvas) return false
        const thisMat = this.calcTransformMatrix()
        const point = new Point(0, this.height / 2)
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const pointInView = switchPointFromLocalToContainer(thisMat, cvsMat, point)
        const offsetHeight = (y - pointInView.y) / this.scaleY
        const toScaleY = (this.height + offsetHeight) / this.originHeight
        const toScaleX = this.width / this.originWidth
        if (toScaleY <= 0) return false

        this._updatePointsAndPath(toScaleX, toScaleY)
        this.setCoords()
        return true
      })
    )
  }

  _updatePointsAndPath(scaleX: number, scaleY: number) {
    this.points = this.originPoints.map((p) => {
      return {
        ...p,
        x: p.x * scaleX,
        y: p.y * scaleY
      }
    })
    const newPathStr = segmentsToPath(this.segments, this.points)
    this._setPath(newPathStr, true)
  }

  _render(ctx: CanvasRenderingContext2D) {
    // this.paintFirst 属性在此对象上无效
    this._renderFill(ctx)
    this._renderPathCommands(ctx)
    // this._renderPaintInOrder(ctx)
    this._renderStroke(ctx)
  }

  _renderFill(ctx: CanvasRenderingContext2D) {
    if (!this.fill) {
      return
    }

    ctx.save()
    this._setFillStyles(ctx, this)

    const inner = pathToFaces(this.path)
    //? 路径数据是基于画布坐标系的，而绘制时需要将其转换为基于对象坐标系, 因为对象在绘制时会应用对象的变换矩阵
    const l = -this.pathOffset.x
    const t = -this.pathOffset.y
    // 将内部面单独填充
    for (const face of inner) {
      ctx.beginPath()

      const startPoint = new Point(face.points[0].x, face.points[0].y)
      ctx.moveTo(startPoint.x + l, startPoint.y + t)
      for (let i = 1; i < face.points.length; i++) {
        const point = new Point(face.points[i].x, face.points[i].y)
        ctx.lineTo(point.x + l, point.y + t)
      }
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  createPenPathControls() {
    const controls = {}
    // const anchorPoints = this.points.filter((point) => point.role === 'anchor')
    // anchorPoints.forEach((point) => {
    //   controls[point.id] = new Control({
    //     actionName: 'move-point',
    //     positionHandler:,
    //     actionHandler:
    //   })
    // })
    return controls
  }
  /** 进入控制点状态 */
  // enterControlState() {
  //   new BasePen
  // }
}

classRegistry.setClass(FPenPath, 'fpenpath')
classRegistry.setSVGClass(FPenPath, 'fpenpath')
