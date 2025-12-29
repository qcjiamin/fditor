import { Point } from 'fabric'

/** 钢笔工具的状态，常规、连线 */
export type penState = 'move' | 'line'
export type segmentType = 'line' | 'quadratic' | 'cubic'
export type penPoint = {
  id: string
  type: penState
  point: Point
  fake: boolean
  hover: boolean
  selected: boolean
  role: 'anchor' | 'handle'
  /** 仅在状态为handel的情况下才有，用以表示当前控制点属于哪个线段 */
  ownerSegmentId?: string
}

export type penSegment = {
  id: string
  from: penPoint
  to: penPoint
  type: segmentType
  handleIn?: penPoint
  handleOut?: penPoint
  fake: boolean
  selected: boolean
}
