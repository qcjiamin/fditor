export type penState = 'move' | 'line'
export type segmentType = 'line' | 'quadratic' | 'cubic'
export type penPoint = {
  id: string
  type: penState
  x: number
  y: number
  hover: boolean
  selected: boolean
  role: 'anchor' | 'handle'
  /** 仅在状态为handel的情况下才有，用以表示当前控制点属于哪个线段 */
  ownerSegmentId?: string
}

export type penSegment = {
  id: string
  from: string
  to: string
  type: segmentType
  handleIn?: string
  handleOut?: string
  selected: boolean
}

export type penData = {
  points: penPoint[]
  segments: penSegment[]
}
