import { classRegistry } from 'fabric'
import { FPath } from './FPath'
import type { FPathProps } from './FPath'

/**
 * 获取矩形path字符串
 * @param width
 * @param height
 * @returns
 */
function getTrianglePath(width: number, height: number) {
  const topX = width / 2
  return `M 0 ${height} L ${width} ${height} L ${topX} 0 Z`
}

export class FTriangle extends FPath {
  public static type = 'ftriangle'
  constructor(options: Partial<FPathProps> = {}) {
    const pathStr = getTrianglePath(options.width ?? 300, options.height ?? 300)
    super(pathStr, options)
    this.radiusAble = true
  }
}

classRegistry.setClass(FTriangle, 'ftriangle')
classRegistry.setSVGClass(FTriangle, 'ftriangle')
