// export type GradientUnits = 'pixels' | 'percentage';

// export type GradientType = 'linear' | 'radial';
import type { GradientType, GradientUnits } from 'fabric'
// import {}
export interface StrokeConfig {
  stroke: string
  strokeWidth: number
  dash: number[]
}

// ---- 定义颜色信息 start---------
export interface ColorOption<T, V> {
  type: T
  value: V
}

interface GradientOptionMap {
  linear: {
    type: 'linear'
    units: GradientUnits
    colors: string[]
    degree: number
  }
  radial: {
    type: 'radial'
    units: GradientUnits
    colors: string[]
    percent: number
  }
}

export type GradientOption<T extends GradientType> = GradientOptionMap[T]

type SolidInfo = ColorOption<'solid', string | null>
export type GradientInfo = ColorOption<'gradient', GradientOption<GradientType>>

export type ColorInfo = SolidInfo | GradientInfo
// ---- 定义颜色信息 end ---------
