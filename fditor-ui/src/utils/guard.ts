import { FLine, FPath } from '@fditor/core'
import type { FabricObject } from 'fabric'

export function isShape(obj: FabricObject): obj is FPath {
  return Object.hasOwn(obj, 'radiusAble')
}

export function isLine(obj: FabricObject): obj is FLine {
  return obj.type === 'fline'
}
