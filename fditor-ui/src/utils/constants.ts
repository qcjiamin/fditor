export const resourceNames = ['image', 'video', 'text', 'shape'] as const
export type ResourceName = (typeof resourceNames)[number]

export const sidebarPropertyTypes = ['', 'animate', 'effect', 'fonts'] as const
/** 侧边栏显示的属性*/
export type sidebarPropertyType = (typeof sidebarPropertyTypes)[number]

/** 字体文件字重号与名字映射表 */
export const fontWeightMap = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800
}
export const fontWeights = Object.keys(fontWeightMap)

//todo: key是number, 能否明确是 100,200,300
export type FontWeightKey = keyof typeof fontWeightMap
export type FontWeightValue = (typeof fontWeightMap)[FontWeightKey]
/** 反向字重映射 */
export const FontWeightReverseMap: Record<FontWeightValue, FontWeightKey> = Object.fromEntries(
  Object.entries(fontWeightMap).map(([key, value]) => [value, key])
) as Record<FontWeightValue, FontWeightKey>
