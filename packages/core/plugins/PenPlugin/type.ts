import { Point } from 'fabric'
import BasePen from './basePen'

/** 钢笔工具的子类型 */
export type subPenType = 'pen' | 'select' | 'curve'
/** 钢笔工具-绘制工具的状态，常规、连线 */
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
  handleIn?: penPoint
  handleOut?: penPoint
  selected: boolean
}

export interface ISubPen {
  type: subPenType // 状态类型
  onMouseDown(pen: BasePen, point: Point): void // 鼠标按下
  onMouseMove(pen: BasePen, point: Point): void // 鼠标移动
  onMouseUp(pen: BasePen, point: Point): void // 鼠标松开
  enter(pen: BasePen): void // 进入该状态时的初始化（如切换光标）
  exit(pen: BasePen): void // 退出该状态时的清理（如重置临时数据）
  _render(pen: BasePen): void
}
