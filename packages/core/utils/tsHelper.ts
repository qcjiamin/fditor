import { Canvas } from 'fabric'
import { FCanvas } from '../customShape/FCanvas'

/** 提取对象的制定属性的类型 */
export type PropType<T, K extends keyof T> = T[K]

export function isFCanvas(cvs: Canvas): cvs is FCanvas {
  return Object.prototype.hasOwnProperty.call(cvs, '_insertBefore')
}
