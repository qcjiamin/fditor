import type { BaseBrush, Canvas } from 'fabric'

// 定义笔触类型
export type brushType = 'pencil' | 'circle' | 'spray' | 'pattern'
export type patternType = 'hline' | 'square'
/** 笔触构造函数 */
export type BrushConstructor = new (canvas: Canvas) => BaseBrush
