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
  fileName: string
}
export type FontInfo = {
  [name in FontFamilyName]: Partial<Record<FontWeight | FontStyle, SubFontFamilyInfo>>
}

export const typedFontInfo: FontInfo = fontInfo
