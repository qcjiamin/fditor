//todo: 裁剪的蒙版状态
import { classRegistry } from 'fabric'
import { FPath, FPathProps } from './FPath'

/**
 * 获取矩形path字符串
 * @param width
 * @param height
 * @returns
 */
function getRectPath(width: number, height: number) {
  return `M 0 0 H ${width} V ${height} H0 Z`
}

export class FRect extends FPath {
  public static type = 'frect'
  constructor(options: Partial<FPathProps> = {}) {
    const pathStr = getRectPath(options.width ?? 300, options.height ?? 150)
    super(pathStr, options)
    this.radiusAble = true
  }
}

classRegistry.setClass(FRect, 'frect')
classRegistry.setSVGClass(FRect, 'frect')
