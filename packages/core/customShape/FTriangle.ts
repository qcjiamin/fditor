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

  /**
   * 从 JSON 对象创建 FTriangle 实例
   * Fabric.js 在 loadFromJSON 时会调用此方法
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async fromObject(object: any) {
    return new FTriangle(object)
  }

  constructor(options: Partial<FPathProps> = {}) {
    // 从 JSON 加载时使用已保存的 path，创建新对象时生成 path
    let pathStr: string
    if (options.path) {
      pathStr = Array.isArray(options.path) ? options.path.map((cmd) => cmd.join(' ')).join(' ') : options.path
    } else {
      pathStr = getTrianglePath(options.width ?? 300, options.height ?? 300)
    }
    super(pathStr, options)
    this.radiusAble = true
  }
}

classRegistry.setClass(FTriangle, 'ftriangle')
classRegistry.setSVGClass(FTriangle, 'ftriangle')
