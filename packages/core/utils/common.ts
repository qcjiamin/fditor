import type { Transformer } from 'konva/lib/shapes/Transformer'
import type { Vector2d } from 'konva/lib/types'

export function getObjInTransformerByPoint(transformer: Transformer, point: Vector2d) {
  const nodes = transformer.nodes()
  let pointObj = null
  if (nodes.length === 0) return pointObj
  for (let i = 0; i < nodes.length; i++) {
    const obj = nodes[i]
    /** 视觉上的范围，相对于画布 */
    const rect = obj.getClientRect()
    if (point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) {
      pointObj = obj
    }
  }
  return pointObj
}

/** 
 获取工作区按照容器宽高缩放度
 @param destination 工作区比例
 @param source 容器当前宽高
 */
export function findScaleToFit(
  source: { width: number; height: number },
  destination: { width: number; height: number }
) {
  return Math.min(destination.width / source.width, destination.height / source.height)
}
