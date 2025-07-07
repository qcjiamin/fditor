import { classRegistry, Point, TMat2D, TPointerEvent, Transform } from 'fabric'
import { FPath, FPathProps } from './FPath'
import { wrapWithFireEvent, wrapWithFixedAnchor } from '../helper'
import { switchPointFromLocalToContainer } from '../utils/mat'

/**
 * 获取六边形path字符串
 * @param width
 * @param height
 * @returns
 */
function createHexagonPath(width: number, height: number): string {
  //todo 变成菱形时，是画菱形，还是画六边形，但最小边保留 0.1
  if (width === FixedWidth * 2) {
    return `M${width}, ${height / 2} L${FixedWidth}, ${height} L${0}, ${height / 2} L${width / 2}, 0, Z)}`
  }
  return `M${width},${height / 2} L${width - FixedWidth},${height} L${FixedWidth},${height} L0,${height / 2} L${FixedWidth},0 L ${width - FixedWidth},0 L${width},${height / 2} Z`
}

/** 左右2个三角形的固定高度 */
const FixedWidth = 74.47272727272727
/** 默认宽 */
const DefWidth = 297.8909090909091
/** 默认高 */
const DefHeight = 256

export class FHexagon extends FPath {
  public static type = 'fhexagon'
  constructor(options: Partial<FPathProps> = {}) {
    const pathStr = createHexagonPath(DefWidth, DefHeight)
    super(pathStr, options)
    this.radiusAble = true

    // 重写拉伸逻辑
    this.controls.ml.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
        if (!this.canvas) return false
        // 计算真实宽度
        const thisMat = this.calcTransformMatrix()
        // 左中点在thisMat中的坐标
        const mlPoint = new Point(-this.width / 2, 0)
        // 返回的xy是基于 viewTransform 的，因此这里造一个初始变化矩阵，让计算出的点是基于viewTransform的
        // const viewMat = this.canvas.viewportTransform
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const mlPointInView = switchPointFromLocalToContainer(thisMat, cvsMat, mlPoint)
        //! 支持缩放(在组内时被组代理会有scale值)
        const offsetWidth = (mlPointInView.x - x) / this.scaleX
        let toWidth = this.width + offsetWidth
        if (toWidth < FixedWidth * 2) {
          toWidth = FixedWidth * 2
        }
        // 用 toWidth 重新获取path
        const newPathStr = createHexagonPath(toWidth, this.height)
        this._setPath(newPathStr, true)
        this.setCoords()
        return true
      })
    )
    this.controls.mr.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
        if (!this.canvas) return false
        // 计算真实宽度
        const thisMat = this.calcTransformMatrix()
        // 左中点在thisMat中的坐标
        const point = new Point(this.width / 2, 0)
        // 返回的xy是基于 viewTransform 的，因此这里造一个初始变化矩阵，让计算出的点是基于viewTransform的
        // const viewMat = this.canvas.viewportTransform
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const pointInView = switchPointFromLocalToContainer(thisMat, cvsMat, point)
        const offsetWidth = (x - pointInView.x) / this.scaleX
        let toWidth = this.width + offsetWidth
        if (toWidth < FixedWidth * 2) {
          toWidth = FixedWidth * 2
        }
        const newPathStr = createHexagonPath(toWidth, this.height)
        console.log(newPathStr)
        this._setPath(newPathStr, true)
        this.setCoords()
        return true
      })
    )
    this.controls.mt.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
        if (!this.canvas) return false
        // 计算真实宽度
        const thisMat = this.calcTransformMatrix()
        // 上点在thisMat中的坐标
        const point = new Point(0, -this.height / 2)
        // 返回的xy是基于 viewTransform 的，因此这里造一个初始变化矩阵，让计算出的点是基于viewTransform的
        // const viewMat = this.canvas.viewportTransform
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const pointInView = switchPointFromLocalToContainer(thisMat, cvsMat, point)
        const offsetHeight = (pointInView.y - y) / this.scaleY
        const toHeight = this.height + offsetHeight
        if (toHeight < 0) return false
        const newPathStr = createHexagonPath(this.width, toHeight)
        this._setPath(newPathStr, true)
        this.setCoords()
        return true
      })
    )
    this.controls.mb.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
        if (!this.canvas) return false
        // 计算真实宽度
        const thisMat = this.calcTransformMatrix()
        // 上点在thisMat中的坐标
        const point = new Point(0, this.height / 2)
        // 返回的xy是基于 viewTransform 的，因此这里造一个初始变化矩阵，让计算出的点是基于viewTransform的
        // const viewMat = this.canvas.viewportTransform
        const cvsMat = [1, 0, 0, 1, 0, 0] as TMat2D
        const pointInView = switchPointFromLocalToContainer(thisMat, cvsMat, point)
        const offsetHeight = (y - pointInView.y) / this.scaleY
        const toHeight = this.height + offsetHeight
        if (toHeight < 0) return false
        const newPathStr = createHexagonPath(this.width, toHeight)
        this._setPath(newPathStr, true)
        this.setCoords()
        return true
      })
    )
  }
}

classRegistry.setClass(FHexagon, 'fhexagon')
classRegistry.setSVGClass(FHexagon, 'fhexagon')
