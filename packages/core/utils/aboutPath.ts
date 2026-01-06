import { Face, NormalPoint, Segment, XNode } from '@fditor/core'
import { TSimplePathData } from 'fabric'

/** 从 TSimplePathData 中获取封闭的面 */
export function pathToFaces(path: TSimplePathData): Face[] {
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

  // 将每一条线段列出来
  const rawSegments: Segment[] = []

  let lastX = 0
  let lastY = 0
  let startX = 0
  let startY = 0

  for (let i = 0; i < path.length; i++) {
    const command = path[i]
    const type = command[0]

    if (type === 'M') {
      lastX = command[1] as number
      lastY = command[2] as number
      startX = lastX
      startY = lastY
    } else if (type === 'L') {
      const x = command[1] as number
      const y = command[2] as number
      rawSegments.push({
        a: { x: lastX, y: lastY },
        b: { x, y }
      })
      lastX = x
      lastY = y
    } else if (type === 'Q') {
      const x1 = command[1] as number
      const y1 = command[2] as number
      const x = command[3] as number
      const y = command[4] as number

      // Flatten Quadratic Bezier
      // 估算曲线长度: P0->P1 + P1->P2
      const len = Math.hypot(x1 - lastX, y1 - lastY) + Math.hypot(x - x1, y - y1)
      const steps = Math.max(10, Math.ceil(len / 2)) // 每2px采样一次，最少10段

      let prevX = lastX
      let prevY = lastY

      for (let j = 1; j <= steps; j++) {
        const t = j / steps
        const invT = 1 - t
        const currX = invT * invT * lastX + 2 * invT * t * x1 + t * t * x
        const currY = invT * invT * lastY + 2 * invT * t * y1 + t * t * y

        rawSegments.push({
          a: { x: prevX, y: prevY },
          b: { x: currX, y: currY }
        })
        prevX = currX
        prevY = currY
      }
      lastX = x
      lastY = y
    } else if (type === 'C') {
      const x1 = command[1] as number
      const y1 = command[2] as number
      const x2 = command[3] as number
      const y2 = command[4] as number
      const x = command[5] as number
      const y = command[6] as number

      // Flatten Cubic Bezier
      // 估算曲线长度
      const len = Math.hypot(x1 - lastX, y1 - lastY) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2)
      const steps = Math.max(10, Math.ceil(len / 2))

      let prevX = lastX
      let prevY = lastY

      for (let j = 1; j <= steps; j++) {
        const t = j / steps
        const invT = 1 - t
        const currX =
          invT * invT * invT * lastX + 3 * invT * invT * t * x1 + 3 * invT * t * t * x2 + t * t * t * x
        const currY =
          invT * invT * invT * lastY + 3 * invT * invT * t * y1 + 3 * invT * t * t * y2 + t * t * t * y

        rawSegments.push({
          a: { x: prevX, y: prevY },
          b: { x: currX, y: currY }
        })
        prevX = currX
        prevY = currY
      }
      lastX = x
      lastY = y
    } else if (type === 'Z') {
      if (lastX !== startX || lastY !== startY) {
        rawSegments.push({
          a: { x: lastX, y: lastY },
          b: { x: startX, y: startY }
        })
      }
      lastX = startX
      lastY = startY
    }
  }
  const split = splitSegments(rawSegments)
  const nodes = buildGraph(split)
  sortEdges(nodes)
  const faces = extractFaces(nodes)
  const inner = filterInnerFaces(faces)
  return inner
}
