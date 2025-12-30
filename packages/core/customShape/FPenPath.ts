import { classRegistry, Control, Point } from 'fabric'
import type { Face, NormalPoint, Segment, XNode } from '../types/common/types'
import { FPath, FPathProps } from './FPath'
import { objectCommonProperties } from '../utils/constant'
import { penPoint, penSegment } from '../plugins/PenPlugin/type'

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
  // points 和 segments 必填
  constructor(path: string, options: Partial<FPathProps> & UniqueFPenPathProps) {
    super(path, options)
    this.points = options.points
    this.segments = options.segments
  }

  _render(ctx: CanvasRenderingContext2D) {
    // this.paintFirst 属性在此对象上无效
    this._renderFill(ctx)
    this._renderPathCommands(ctx)
    // this._renderPaintInOrder(ctx)
    this._renderStroke(ctx)
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

    // 将所有的Z转换为L，不然拆分线段时会出错
    // 可以和拆分线段放在一个循环里，这里为了逻辑清晰分开处理
    const copyPath = this.path.slice()
    let lastM = null
    for (let i = 0; i < copyPath.length; i++) {
      const item = copyPath[i]
      if (item[0] === 'M') {
        lastM = item
      } else if (item[0] === 'Z') {
        if (lastM) {
          copyPath[i] = ['L', lastM[1], lastM[2]]
        } else {
          throw new Error('Z command must follow M command')
        }
      }
    }

    let a = null
    let b = null
    for (let i = 0; i < copyPath.length; i++) {
      if (i > 0) {
        const lastItem = copyPath[i - 1]
        const item = copyPath[i]
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
    //? 路径数据是基于画布坐标系的，而绘制时需要将其转换为基于对象坐标系
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
