import { Canvas, FabricObject, Gradient } from 'fabric'
import type Editer from './Editor'

// export type colorVal = string | TFiller | null
export type LinearGradient = Gradient<'linear'> & { _degree: number }
export type RadialGradient = Gradient<'radial'> & { _percent: number }
export type _Gradient = LinearGradient | RadialGradient
export type colorVal = string | _Gradient | null

export interface IPlugin {
  name: string
  init(editer: Editer): void
}

export enum Layout {
  Landscape = 'Landscape', // 横版
  Portrait = 'Portrait', // 竖版
  Square = 'Square' // 方版
}
// 定义宽高映射
export const layoutDimensions: Record<Layout, { width: number; height: number }> = {
  [Layout.Landscape]: { width: 1920, height: 1080 }, // 横版宽高
  [Layout.Portrait]: { width: 1080, height: 1920 }, // 竖版宽高
  [Layout.Square]: { width: 1080, height: 1080 } // 方版宽高
}

export interface EditorEventMap {
  'selected:change': FabricObject | undefined
  // 'canvas:resize': { width: number; height: number }
  'node:add': FabricObject[]
  'node:remove': FabricObject[] | FabricObject
  'node:modified': { target: FabricObject | Canvas | FabricObject[] }
  // 'node:zindex:change': KonvaNode[]
  // 'node:update:before': { nodes: KonvaNode[] }
  // 'node:update:after': { nodes: KonvaNode[] }
  'workspace:resize': null
  'plugin:installed': IPlugin
  'layout:change': null
  'canvas:ready': null
  // 区分修改与历史记录更新
  'history:update': void
  'confirm:clip': void
}

//todo: mainLayer 更具体的定义
export type Scene = {
  bgColor: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainLayer: any
}

export type Config = {
  scenes: Scene[]
}

// export type KditorEventValues = {
//   [K in keyof KditorEventMap]: KditorEventMap[K] // 提取数组中的第一个元素
// }

export type HorizontalAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'
