// todo 深入了解 wrapWithFixedAnchor
// 实现策略：path属性始终保持不带圆角的path，绘制时根据圆角设置动态计算出带圆角path再绘制

import {
  classRegistry,
  Path,
  PathProps,
  Point,
  // TComplexPathData,
  TMat2D,
  TPointerEvent,
  Transform,
  TSimplePathData,
  util
} from 'fabric'
import { createLinearGradient, createRadialGradient, wrapWithFireEvent, wrapWithFixedAnchor } from '../helper'
import { switchPointFromLocalToContainer } from '../utils/mat'
import svgPath from 'svgpath'
import { roundCorners } from 'svg-round-corners'
import { SVG } from '@svgdotjs/svg.js'
import paperFull from 'paper/dist/paper-core'
import { isFiller, isPattern } from '../utils/typeAssertions'
import { LinearGradient, RadialGradient } from '../types'

function pathToPathStr(path: TSimplePathData) {
  return path.toString().replaceAll(',', ' ')
}
/**
 * 获取 pathstr 渲染出的宽度
 * @param pathStr
 * @returns
 */
function getSvgPathBox(pathStr: string) {
  const draw = SVG().size(0, 0)
  const path = draw.path(pathStr)
  const box = path.bbox()
  return box
}

/**
 * 获取 pathstr 可以设置的最小的圆角值
 * @param pathStr
 * @returns
 */
function getMaxRadius(pathStr: string) {
  // 创建画布（离屏）
  paperFull.setup(new paperFull.Size(1000, 1000))

  // 创建路径
  const path = new paperFull.Path(pathStr)
  path.closed = true

  // 获取每个角的最大圆角半径
  const maxRadiusList = []

  for (let i = 0; i < path.segments.length; i++) {
    const curr = path.segments[i]
    const prev = path.segments[(i - 1 + path.segments.length) % path.segments.length]
    const next = path.segments[(i + 1) % path.segments.length]

    const v1 = prev.point.subtract(curr.point)
    const v2 = next.point.subtract(curr.point)

    const angle = v1.getAngle(v2)
    const minLen = Math.min(v1.length, v2.length)

    // 通过三角函数计算最大圆角半径
    const maxR = Math.abs(minLen * Math.tan(((angle / 2) * Math.PI) / 180))
    maxRadiusList.push(maxR) // 限制最大值（可配置）
  }
  console.log(maxRadiusList)
  //todo 简单除以2就行了吗？
  return maxRadiusList.length > 0 ? Math.min(...maxRadiusList) / 2 : 0
}
// function isString(path: TComplexPathData | string): path is string {
//   return typeof path === 'string'
// }

interface UniqueFPathProps {
  radiusAble: boolean
  cornerRadius: number
}
export interface FPathProps extends PathProps, UniqueFPathProps {}

export class FPath extends Path {
  public static type = 'fpath'
  public static customProperties: string[] = ['cornerRadius', 'radiusAble', 'originPath']
  public cornerRadius: number = 0
  public radiusAble: boolean = false
  public originPath: string
  public originWidth: number
  public originHeight: number
  constructor(path: string, options: Partial<FPathProps> = {}) {
    const _path = roundCorners(path, options.cornerRadius ?? 0).path
    super(_path, {
      radiusAble: false,
      ...options,
      noScaleCache: false,
      flipX: false,
      flipY: false,
      //todo rx ry 更新后， isCacheDirty 仍然为false,会导致不重绘，圆角显示不出来。 这里先不要缓存，后面重写 isCacheDirty
      objectCaching: false
    })
    this.originPath = path
    this.cornerRadius = options.cornerRadius ?? 0
    const box = getSvgPathBox(this.originPath)
    this.originWidth = box.width
    this.originHeight = box.height
    // 重写上下左右4个点的actionhandler
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
        //todo: 完全自理组缩放时的缩放；4个对角actionhandler重构
        const offsetWidth = (mlPointInView.x - x) / this.scaleX
        const toScaleX = (this.width + offsetWidth) / this.originWidth
        const toScaleY = this.height / this.originHeight
        if (toScaleX <= 0) return false
        const newPathStr = svgPath(this.originPath).scale(toScaleX, toScaleY).toString()
        // const maxRadius = getMaxRadius(newPathStr)
        // const toRadius = maxRadius * (this.cornerRadius / 100)
        // newPathStr = roundCorners(newPathStr, toRadius).path
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
        const toScaleX = (this.width + offsetWidth) / this.originWidth
        const toScaleY = this.height / this.originHeight
        if (toScaleX <= 0) return false
        const newPathStr = svgPath(this.originPath).scale(toScaleX, toScaleY).toString()
        // newPathStr = roundCorners(newPathStr, this.cornerRadius).path
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
        const toScaleY = (this.height + offsetHeight) / this.originHeight
        const toScaleX = this.width / this.originWidth
        if (toScaleY <= 0) return false
        const newPathStr = svgPath(this.originPath).scale(toScaleX, toScaleY).toString()
        // newPathStr = roundCorners(newPathStr, this.cornerRadius).path
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
        const toScaleY = (this.height + offsetHeight) / this.originHeight
        const toScaleX = this.width / this.originWidth
        if (toScaleY <= 0) return false
        const newPathStr = svgPath(this.originPath).scale(toScaleX, toScaleY).toString()
        // newPathStr = roundCorners(newPathStr, this.cornerRadius).path
        this._setPath(newPathStr, true)
        this.setCoords()
        return true
      })
    )
    this.on('resizing', () => {
      this.resetGradient()
    })
  }

  _renderPathCommands(ctx: CanvasRenderingContext2D) {
    // 绘制前通过圆角重新计算 path
    const pathStr = pathToPathStr(this.path)
    const maxRadius = getMaxRadius(pathStr)
    console.log(maxRadius)
    const toRadius = maxRadius * (this.cornerRadius / 100)
    const newPathStr = roundCorners(pathStr, toRadius).path
    // 解析为 TSimplePathData, 参考 Path._setPath
    const _path = util.makePathSimpler(util.parsePath(newPathStr))
    //! setBoundingBox 影响width height pathOffset。 理论上这里只重新计算圆角，不影响bound，先不调用
    // this.setBoundingBox(adjustPosition);

    const l = -this.pathOffset.x,
      t = -this.pathOffset.y

    ctx.beginPath()

    // for (const command of this.path) {
    for (const command of _path) {
      switch (
        command[0] // first letter
      ) {
        case 'L': // lineto, absolute
          ctx.lineTo(command[1] + l, command[2] + t)
          break

        case 'M': // moveTo, absolute
          ctx.moveTo(command[1] + l, command[2] + t)
          break

        case 'C': // bezierCurveTo, absolute
          ctx.bezierCurveTo(
            command[1] + l,
            command[2] + t,
            command[3] + l,
            command[4] + t,
            command[5] + l,
            command[6] + t
          )
          break

        case 'Q': // quadraticCurveTo, absolute
          ctx.quadraticCurveTo(command[1] + l, command[2] + t, command[3] + l, command[4] + t)
          break

        case 'Z':
          ctx.closePath()
          break
      }
    }
  }

  resetGradient() {
    if (!isFiller(this.fill)) return
    if (isPattern(this.fill)) return
    const colors = this.fill.colorStops.map((stop) => stop.color)
    if (this.fill.type === 'linear') {
      const fill = this.fill as LinearGradient
      // const { x1, y1, x2, y2 } = this.fill.coords
      // const degree = getAngleFromTwoPoints(x1, y1, x2, y2)
      const degree = fill._degree
      const autoGradient = createLinearGradient('pixels', degree, this.width, this.height, ...colors)
      this.set('fill', autoGradient)
    } else if (this.fill.type === 'radial') {
      const fill = this.fill as RadialGradient
      const percent = fill._percent
      const autoGradient = createRadialGradient('pixels', percent, this.width, this.height, ...colors)
      this.set('fill', autoGradient)
    }
    if (this.canvas) this.canvas.requestRenderAll()
  }
}

classRegistry.setClass(FPath, 'fpath')
classRegistry.setSVGClass(FPath, 'fpath')
