// 来自 fabric 源码。从一些复合类型中判断具体类型

import type { LinearGradient, RadialGradient } from '@fditor/core'
import { ActiveSelection, FabricObject, FabricText, Gradient, Path, Pattern } from 'fabric'
import type { Group, TFiller } from 'fabric'
import { BaseSubPen } from '../plugins/PenPlugin/baseSubPen'
import SubPen from '../plugins/PenPlugin/subPen'
import SubSelect from '../plugins/PenPlugin/subSelect'

export const isFiller = (filler: TFiller | string | null): filler is TFiller => {
  return !!filler && (filler as TFiller).toLive !== undefined
}
export function isRadialGradient(gradient: Gradient<'radial', 'radial'>): gradient is RadialGradient {
  return gradient.type === 'radial'
}
export function isLinearGradient(gradient: Gradient<'linear', 'linear'>): gradient is LinearGradient {
  return gradient.type === 'linear'
}

export const isSerializableFiller = (filler: TFiller | string | null): filler is TFiller => {
  return !!filler && typeof (filler as TFiller).toObject === 'function'
}

export const isPattern = (filler: TFiller): filler is Pattern => {
  return !!filler && (filler as Pattern).offsetX !== undefined && 'source' in filler
}

export const isTextObject = (fabricObject?: FabricObject): fabricObject is FabricText => {
  return !!fabricObject && typeof (fabricObject as FabricText)._renderText === 'function'
}

export const isPath = (fabricObject?: FabricObject): fabricObject is Path => {
  // we could use instanceof but that would mean pulling in Text code for a simple check
  // @todo discuss what to do and how to do
  return !!fabricObject && typeof (fabricObject as Path)._renderPathCommands === 'function'
}

export const isActiveSelection = (fabricObject?: FabricObject): fabricObject is ActiveSelection =>
  !!fabricObject && 'multiSelectionStacking' in fabricObject

export function isGroup(obj: FabricObject | Group): obj is Group {
  return obj.type === 'group'
}

// 自定义
export function isSubPen(tool: BaseSubPen): tool is SubPen {
  // 使用 instanceof 检查，因为类方法定义在原型上，不是自有属性
  // hasOwnProperty 只检查自有属性，会导致误判
  return tool instanceof SubPen
}

export function isSubSelect(tool: BaseSubPen): tool is SubSelect {
  // 使用 instanceof 检查，因为类方法定义在原型上，不是自有属性
  // hasOwnProperty 只检查自有属性，会导致误判
  return tool instanceof SubSelect
}
