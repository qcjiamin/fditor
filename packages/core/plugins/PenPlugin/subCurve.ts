import { Point } from 'fabric'
import BasePen from './basePen'
import { BaseSubPen } from './baseSubPen'
import { subPenType } from '@fditor/core'

export default class SubCurve extends BaseSubPen {
  type: subPenType = 'curve'

  onMouseDown(pen: BasePen, point: Point): void {
    pen.clearSelcted()
    // 是否点在控制点
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      hoverPenPoint.selected = true
    }
    this._render(this.pen)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseMove(pen: BasePen, point: Point): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(pen: BasePen, point: Point): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enter(pen: BasePen): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exit(pen: BasePen): void {}
  _render(pen: BasePen): void {
    super.enter(pen)
  }
}
