import type { FontWeight } from '@/utils/types'

export const tabNames = ['resource', 'animation', 'fonts'] as const
export type TabName = (typeof tabNames)[number]

/** 更新 fontfamily 的权重参数 */
export type updateFontFamilyWeightParam = FontWeight | 'inherit'
