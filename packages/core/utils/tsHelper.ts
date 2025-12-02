import { Canvas } from 'fabric'
import { FCanvas } from '../customShape/FCanvas'

/** 提取对象的制定属性的类型 */
export type PropType<T, K extends keyof T> = T[K]

export function isFCanvas(cvs: Canvas): cvs is FCanvas {
  // 使用 instanceof 检查，因为类方法定义在原型上，不是自有属性
  // hasOwnProperty 只检查自有属性，会导致误判
  return cvs instanceof FCanvas
}
