import { classRegistry, Line, TPointerEvent, Transform } from 'fabric'
import { isFiller } from '../utils/typeAssertions'

export type FLineOptions = ConstructorParameters<typeof Line>[1]
export class FLine extends Line {
  constructor([x1, y1, x2, y2] = [0, 0, 0, 0], options: FLineOptions = {}) {
    super([x1, y1, x2, y2], {
      ...options,
      objectCaching: false,
      strokeUniform: true,
      hasBorders: false
    })
    this.setControlsVisibility({
      tl: false,
      tr: false,
      mt: false,
      bl: false,
      br: false,
      mb: false
    })
    this.controls.ml.cursorStyle = 'pointer'
    // const actionHandler = this.controls.ml.actionHandler
    this.controls.ml.actionHandler = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
      // const zoom = this.canvas!.getZoom()
      this.x1 = x
      this.y1 = y
      // console.log(x * zoom, y * zoom)
      // return actionHandler(eventData, transform, x, y)
      return true
    }
  }

  calcLinePoints() {
    const { x1: _x1, x2: _x2, y1: _y1, y2: _y2, width, height } = this
    const xMult = _x1 <= _x2 ? -1 : 1,
      yMult = _y1 <= _y2 ? -1 : 1,
      x1 = (xMult * width) / 2,
      y1 = (yMult * height) / 2,
      x2 = (xMult * -width) / 2,
      y2 = (yMult * -height) / 2
    console.log(xMult, yMult)

    return {
      x1,
      x2,
      y1,
      y2
    }
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    console.log(this.x1, this.y1, this.x2, this.y2)
    // const p = this.calcLinePoints()

    ctx.moveTo(this.x1, this.y1)
    ctx.lineTo(this.x2, this.y2)

    ctx.lineWidth = this.strokeWidth

    // TODO: test this
    // make sure setting "fill" changes color of a line
    // (by copying fillStyle to strokeStyle, since line is stroked, not filled)
    const origStrokeStyle = ctx.strokeStyle
    if (isFiller(this.stroke)) {
      ctx.strokeStyle = this.stroke.toLive(ctx)!
    } else {
      ctx.strokeStyle = this.stroke ?? ctx.fillStyle
    }
    if (this.stroke) {
      this._renderStroke(ctx)
    }
    // this.stroke && this._renderStroke(ctx)
    ctx.strokeStyle = origStrokeStyle
  }

  startHandler() {}
  endHandler() {}
}

classRegistry.setClass(FLine, 'fline')
classRegistry.setSVGClass(FLine, 'fline')
