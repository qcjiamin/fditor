/* eslint-disable @typescript-eslint/no-unused-vars */
import { Point } from 'fabric'
import BasePen from './basePen'
import { ISubPen, subPenType } from './type'

export default class SubCurve implements ISubPen {
  type: subPenType = 'curve'

  onMouseDown(pen: BasePen, point: Point): void {}
  onMouseMove(pen: BasePen, point: Point): void {}
  onMouseUp(pen: BasePen, point: Point): void {}
  enter(pen: BasePen): void {}
  exit(pen: BasePen): void {}
  _render(pen: BasePen): void {}
}
