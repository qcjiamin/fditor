import type { BaseBrush, Canvas } from 'fabric'

export type patternType = 'hline' | 'square'
/** 笔触构造函数 */
export type BrushConstructor = new (canvas: Canvas) => BaseBrush
