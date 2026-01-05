import { penPoint, penSegment } from '../plugins/PenPlugin/type'

export function segmentsToPath(segments: penSegment[], points: penPoint[]) {
  let path = ''
  let lastEndPointId: string = ''
  // console.log(segments, points)
  for (let i = 0; i < segments.length; i++) {
    const { type, from, to } = segments[i]
    const fromPoint = points.find((point) => point.id === from) as penPoint
    const toPoint = points.find((point) => point.id === to) as penPoint
    if (!fromPoint || !toPoint) {
      throw new Error('segmentsToPath: fromPoint or toPoint is null')
    }
    if (type === 'line') {
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
    }
  }
  return path
}
