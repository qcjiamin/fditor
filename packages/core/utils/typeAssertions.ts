// 来自 fabric 源码。从一些复合类型中判断具体类型

import { LinearGradient, RadialGradient } from '@fditor/core'
import { ActiveSelection, FabricObject, FabricText, Gradient, Path, Pattern, TFiller } from 'fabric'

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
