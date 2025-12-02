//todo: 裁剪的蒙版状态
import { classRegistry } from 'fabric'
import { FPath, type FPathProps } from './FPath'

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

  /**
   * 从 JSON 对象创建 FRect 实例
   * Fabric.js 在 loadFromJSON 时会调用此方法
   *
   * 注意：FRect 的构造函数签名是 constructor(options)
   * 而父类 Path 的构造函数签名是 constructor(path, options)
   * 所以需要自定义 fromObject 来正确处理反序列化
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async fromObject(object: any) {
    // object 包含所有保存的属性，包括 path 数据
    // 直接传给构造函数，让它使用保存的数据
    return new FRect(object)
  }

  constructor(options: Partial<FPathProps> = {}) {
    // 从 JSON 加载时，options 中会包含已保存的 path 数据
    // 此时应该使用保存的 path，而不是重新生成
    // 只有在创建新对象时才需要生成 path
    let pathStr: string
    if (options.path) {
      // 从 JSON 加载：使用已保存的 path
      pathStr = Array.isArray(options.path)
        ? options.path.map((cmd) => cmd.join(' ')).join(' ') // 将数组转为字符串
        : options.path
    } else {
      // 创建新对象：根据 width/height 生成 path
      pathStr = getRectPath(options.width ?? 300, options.height ?? 150)
    }
    super(pathStr, options)
    this.radiusAble = true
  }
}

classRegistry.setClass(FRect, 'frect')
classRegistry.setSVGClass(FRect, 'frect')
