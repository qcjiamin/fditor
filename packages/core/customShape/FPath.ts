// todo 深入了解 wrapWithFixedAnchor
// 实现策略：path属性始终保持不带圆角的path，绘制时根据圆角设置动态计算出带圆角path再绘制

import {
  classRegistry,
  Path,
  type PathProps,
  Point,
  // TComplexPathData,
  type TMat2D,
  type TPointerEvent,
  type Transform,
  type TSimplePathData,
  util
} from 'fabric'
import { createLinearGradient, createRadialGradient, wrapWithFireEvent, wrapWithFixedAnchor } from '../helper'
import { switchPointFromContainerToLocal, switchPointFromLocalToContainer } from '../utils/mat'
import svgPath from 'svgpath'
import { roundCorners } from 'svg-round-corners'
import { SVG } from '@svgdotjs/svg.js'
import paperFull from 'paper/dist/paper-core'
import { isFiller, isPattern } from '../utils/typeAssertions'
import type { Face, LinearGradient, NormalPoint, RadialGradient, Segment, XNode } from '../types/common/types'
import { objectCommonProperties } from '../utils/constant'

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
  // 包含 id 以确保所有 FPath 子类（FRect、FTriangle、FHexagon）都能正确序列化 id
  public static customProperties: string[] = [
    ...objectCommonProperties,
    'cornerRadius',
    'radiusAble',
    'originPath',
    'originWidth',
    'originHeight'
  ]
  public cornerRadius: number = 0
  public radiusAble: boolean = false
  public originPath: string
  public originWidth: number
  public originHeight: number
  //todo 参考 textbox, 自己实现初始化默认控制点的方法
  // static createControls() {
  //   return {
  //     controls: createFPathDefaultControls()
  //   }
  // }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, x: number, _y: number) => {
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
    this.controls.ml.actionName = 'resizing'
    this.controls.mr.actionHandler = wrapWithFireEvent(
      'resizing',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, x: number, _y: number) => {
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
    this.controls.mr.actionName = 'resizing'
    this.controls.mt.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, _x: number, y: number) => {
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
    this.controls.mt.actionName = 'resizing'
    this.controls.mb.actionHandler = wrapWithFireEvent(
      'resizing',
      wrapWithFixedAnchor((_eventData: TPointerEvent, _transform: Transform, _x: number, y: number) => {
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
    this.controls.mb.actionName = 'resizing'
    this.on('resizing', () => {
      this.resetGradient()
    })
  }

  _renderPathCommands(ctx: CanvasRenderingContext2D) {
    // 绘制前通过圆角重新计算 path
    const pathStr = pathToPathStr(this.path)
    const maxRadius = getMaxRadius(pathStr)
    const toRadius = maxRadius * (this.cornerRadius / 100)
    const newPathStr = roundCorners(pathStr, toRadius).path
    // 解析为 TSimplePathData, 参考 Path._setPath
    const _path = util.makePathSimpler(util.parsePath(newPathStr))
    //! setBoundingBox 影响width height pathOffset。 理论上这里只重新计算圆角，不影响bound，先不调用
    // this.setBoundingBox(adjustPosition);
    console.log(_path)
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

  _renderFill(ctx: CanvasRenderingContext2D) {
    // 求2线交点
    function segmentIntersection(a: NormalPoint, b: NormalPoint, c: NormalPoint, d: NormalPoint): NormalPoint | null {
      const cross = (p: NormalPoint, q: NormalPoint) => p.x * q.y - p.y * q.x

      const r = { x: b.x - a.x, y: b.y - a.y }
      const s = { x: d.x - c.x, y: d.y - c.y }

      const denom = cross(r, s)
      if (Math.abs(denom) < 1e-8) return null

      const t = cross({ x: c.x - a.x, y: c.y - a.y }, s) / denom
      const u = cross({ x: c.x - a.x, y: c.y - a.y }, r) / denom

      if (t > 0 && t < 1 && u > 0 && u < 1) {
        return {
          x: a.x + t * r.x,
          y: a.y + t * r.y
        }
      }
      return null
    }
    // 在交接点位置分割线段
    function splitSegments(segments: Segment[]): Segment[] {
      const result: Segment[] = []

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        const points: { x: number; y: number }[] = [seg.a, seg.b]

        for (let j = 0; j < segments.length; j++) {
          if (i === j) continue
          const p = segmentIntersection(seg.a, seg.b, segments[j].a, segments[j].b)
          if (p) points.push(p)
        }

        // 按在 AB 上的参数排序
        points.sort((p1, p2) => Math.hypot(p1.x - seg.a.x, p1.y - seg.a.y) - Math.hypot(p2.x - seg.a.x, p2.y - seg.a.y))

        for (let k = 0; k < points.length - 1; k++) {
          result.push({ a: points[k], b: points[k + 1] })
        }
      }

      return result
    }
    // 构建平面图
    function buildGraph(segments: Segment[]): XNode[] {
      const nodes = new Map<string, XNode>()

      const key = (p: NormalPoint) => `${p.x.toFixed(4)},${p.y.toFixed(4)}`

      const getNode = (p: NormalPoint): XNode => {
        const k = key(p)
        if (!nodes.has(k)) {
          nodes.set(k, { ...p, edges: [] })
        }
        return nodes.get(k)!
      }

      for (const seg of segments) {
        const a = getNode(seg.a)
        const b = getNode(seg.b)

        a.edges.push({ from: a, to: b, visited: false })
        b.edges.push({ from: b, to: a, visited: false })
      }

      return Array.from(nodes.values())
    }
    // 按角度排序出边[关键]
    function sortEdges(nodes: XNode[]) {
      for (const node of nodes) {
        node.edges.sort((e1, e2) => {
          const a1 = Math.atan2(e1.to.y - node.y, e1.to.x - node.x)
          const a2 = Math.atan2(e2.to.y - node.y, e2.to.x - node.x)
          return a1 - a2
        })
      }
    }
    // 提取闭合面
    function extractFaces(nodes: XNode[]): Face[] {
      const faces: Face[] = []

      for (const node of nodes) {
        for (const edge of node.edges) {
          if (edge.visited) continue

          const face: NormalPoint[] = []
          let currentEdge = edge

          while (!currentEdge.visited) {
            currentEdge.visited = true
            face.push({ x: currentEdge.from.x, y: currentEdge.from.y })

            const toNode = currentEdge.to
            const edges = toNode.edges
            const idx = edges.findIndex((e) => e.to === currentEdge.from)

            // 选“最左转”的下一条边
            const nextEdge = edges[(idx - 1 + edges.length) % edges.length]

            currentEdge = nextEdge
          }

          if (face.length > 2) {
            faces.push({ points: face })
          }
        }
      }

      return faces
    }

    function polygonArea(points: NormalPoint[]): number {
      let area = 0
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        area += p1.x * p2.y - p2.x * p1.y
      }
      return area / 2
    }
    // 过滤掉外部面
    function filterInnerFaces(faces: Face[]): Face[] {
      return faces.filter((face) => polygonArea(face.points) > 0)
    }

    if (!this.fill) {
      return
    }

    ctx.save()
    this._setFillStyles(ctx, this)

    // 将每一条线段列出来
    const rawSegments: Segment[] = []
    let a = null
    let b = null

    for (let i = 0; i < this.path.length; i++) {
      if (i > 0) {
        const lastItem = this.path[i - 1]
        const item = this.path[i]
        a = { x: lastItem[1] as number, y: lastItem[2] as number }
        b = { x: item[1] as number, y: item[2] as number }
        rawSegments.push({ a, b })
      }
    }
    const split = splitSegments(rawSegments)
    const nodes = buildGraph(split)
    sortEdges(nodes)
    const faces = extractFaces(nodes)
    const inner = filterInnerFaces(faces)
    console.log(inner)
    const l = -this.pathOffset.x
    const t = -this.pathOffset.y
    // 将内部面单独填充
    for (const face of inner) {
      ctx.beginPath()

      const m = this.calcTransformMatrix()
      const startPoint = new Point(face.points[0].x, face.points[0].y)
      // let _startPoint = switchPointFromContainerToLocal(m, startPoint)
      const _startPoint = startPoint.transform(m, true)
      // ctx.moveTo(face.points[0].x, face.points[0].y)
      ctx.moveTo(_startPoint.x + l, _startPoint.y + t)
      for (let i = 1; i < face.points.length; i++) {
        const point = new Point(face.points[i].x, face.points[i].y)

        // let _point = switchPointFromContainerToLocal(m, point)
        // _point = _point.transform(m)

        const _point = point.transform(m, true)
        ctx.lineTo(_point.x + l, _point.y + t)
        // ctx.lineTo(face.points[i].x, face.points[i].y)
      }
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }
}

classRegistry.setClass(FPath, 'fpath')
classRegistry.setSVGClass(FPath, 'fpath')
