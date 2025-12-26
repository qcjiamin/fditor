import { Point } from 'fabric'

/** 钢笔工具的状态，常规、连线 */
export type penState = 'move' | 'line'
export type penPoint = {
  type: penState
  point: Point
  fake: boolean
  hover: boolean
  selected: boolean
}
