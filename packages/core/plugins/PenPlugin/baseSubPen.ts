/* eslint-disable @typescript-eslint/no-unused-vars */
import { Point } from 'fabric'
import BasePen from './basePen'
import { subPenType } from '@fditor/core'

export abstract class BaseSubPen {
  abstract type: subPenType

  onMouseDown(pen: BasePen, point: Point): void {}

  onMouseMove(pen: BasePen, point: Point): void {}

  onMouseUp(pen: BasePen, point: Point): void {}

  enter(pen: BasePen): void {
    pen.canvas.fire('subPenType:change', { newType: this.type })
  }

  exit(pen: BasePen): void {}
  _render(pen: BasePen): void {}
}
