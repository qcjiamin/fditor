import { penPoint, penSegment } from '../plugins/PenPlugin/type'

export function segmentsToPath(segments: penSegment[], points: penPoint[]) {
  let path = ''
  let lastEndPointId: string = ''
  // console.log(segments, points)
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const { from, to } = segments[i]
    const fromPoint = points.find((point) => point.id === from) as penPoint
    const toPoint = points.find((point) => point.id === to) as penPoint
    if (!fromPoint || !toPoint) {
      throw new Error('segmentsToPath: fromPoint or toPoint is null')
    }
    const isLine = !seg.handleIn && !seg.handleOut
    if (isLine) {
      const isClose = toPoint.type === 'move'
      if (lastEndPointId === fromPoint.id) {
        if (isClose) {
          path += 'Z'
        } else {
          path += `L${toPoint.x},${toPoint.y}`
        }
      } else {
        path += `M${fromPoint.x},${fromPoint.y}`
        path += `L${toPoint.x},${toPoint.y}`
      }
      lastEndPointId = toPoint.id
    } else {
      const isClose = toPoint.type === 'move'
      if (lastEndPointId !== fromPoint.id) {
        path += `M${fromPoint.x},${fromPoint.y}`
      }
      const { handleIn, handleOut } = segments[i]
      if (handleIn && !handleOut) {
        // 二次贝塞尔
        const h = points.find((p) => p.id === handleIn)
        if (!h) throw new Error('Invalid point')
        path += `Q${h.x},${h.y},${toPoint.x},${toPoint.y}`
      } else if (handleOut && !handleIn) {
        // 二次贝塞尔
        const h = points.find((p) => p.id === handleOut)
        if (!h) throw new Error('Invalid point')
        path += `Q${h.x},${h.y},${toPoint.x},${toPoint.y}`
      } else if (handleIn && handleOut) {
        // 三次贝塞尔
        const h1 = points.find((p) => p.id === handleOut)
        const h2 = points.find((p) => p.id === handleIn)
        if (!h1 || !h2) throw new Error('Invalid point')
        path += `C${h1.x},${h1.y},${h2.x},${h2.y},${toPoint.x},${toPoint.y}`
      }
      if (isClose) {
        path += 'Z'
      }
      lastEndPointId = toPoint.id
    }
  }
  return path
}
