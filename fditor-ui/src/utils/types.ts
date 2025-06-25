import { fontWeightMap } from '@/utils/constants'
import { fontInfo } from '@/utils/fontinfo'
import { FabricObject } from 'fabric'

export type Selected = FabricObject | undefined
export enum ElementType {
  bg = 'bg',
  shape = 'shape',
  image = 'fimage',
  text = 'text'
}

export const CanvasStateArr = ['normal', 'clip'] as const
/** 画布状态=>属性条位置显示的类型 */
export type CanvasStates = (typeof CanvasStateArr)[number]

export const ElementTypeArr = ['bg', 'Shape', 'image', 'text', 'activeselection'] as const
/** 属性条属性类型 */
export type ElementTypes = (typeof ElementTypeArr)[number]

export const GradientTypeArr = ['linear90', 'linear180', 'linear135', 'radial50', 'radial0'] as const
/** 渐变色预定义类型 */
export type GradientTypes = (typeof GradientTypeArr)[number]

// 从一个json对象，生成一个带类型提示的对象
export type FontFamilyName = keyof typeof fontInfo
export type FontWeight = keyof typeof fontWeightMap
export type FontStyle = 'italic' | 'normal'
export type SubFontFamilyInfo = {
  weight: FontWeight
  style: FontStyle
  fileName: string
}
export type FontInfo = {
  [name in FontFamilyName]: SubFontFamilyInfo[]
}

function toTypedFontInfo(raw: typeof fontInfo): FontInfo {
  const result: Partial<FontInfo> = {}

  for (const key in raw) {
    result[key as FontFamilyName] = raw[key as FontFamilyName].map((item) => ({
      weight: item.weight as FontWeight,
      style: item.style as FontStyle,
      fileName: item.fileName
    }))
  }

  return result as FontInfo
}

export const typedFontInfo = toTypedFontInfo(fontInfo)
// export const typedFontInfo: FontInfo = fontInfo
