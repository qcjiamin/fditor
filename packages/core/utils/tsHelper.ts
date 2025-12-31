import { Canvas, FabricObject } from 'fabric'
import { FCanvas } from '../customShape/FCanvas'
import { FPenPath } from '@fditor/core'

export function isFCanvas(cvs: Canvas): cvs is FCanvas {
  // 使用 instanceof 检查，因为类方法定义在原型上，不是自有属性
  // hasOwnProperty 只检查自有属性，会导致误判
  return cvs instanceof FCanvas
}

export function isFPenPath(obj: FabricObject): obj is FPenPath {
  return obj instanceof FPenPath
}
