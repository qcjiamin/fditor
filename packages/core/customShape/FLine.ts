import {
  classRegistry,
  FabricObject,
  FabricObjectProps,
  Line,
  ObjectEvents,
  Point,
  SerializedObjectProps,
  TOptions,
  TPointerEvent,
  Transform
} from 'fabric'
import { wrapWithFixedAnchor } from '../helper'

export function getAngleFromTwoPoints(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const rad = Math.atan2(dy, dx) // 弧度，范围 (-π, π]
  const deg = rad * (180 / Math.PI) // 转换为角度
  // const deg360 = (deg + 360) % 360
  return deg
}
function degToRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export class FLine<
  Props extends TOptions<FabricObjectProps> = Partial<FabricObjectProps>,
  SProps extends SerializedObjectProps = SerializedObjectProps,
  EventSpec extends ObjectEvents = ObjectEvents
> extends FabricObject<Props, SProps, EventSpec> {
  //! 需要设置 left top width[线长] strokeWidth[线的厚度]
  constructor(options: Partial<Props> = {}) {
    // 必须设置strokeWidth
    // height 设置为0？
    super()
    Object.assign(this, Line.ownDefaults)
    this.setOptions({
      ...options,
      // strokeWidth 不能小于1
      strokeWidth: options.strokeWidth ? (options.strokeWidth < 1 ? 1 : options.strokeWidth) : 1,
      // 不跟随缩放，让 _getTransformedDimensions 计算 strokeWidth的值
      strokeUniform: true,
      hasBorders: false,
      noScaleCache: false
    })
    this.setControlsVisibility({
      tl: false,
      mt: false,
      tr: false,
      bl: false,
      mb: false,
      br: false
    })

    this.controls.ml.actionHandler = wrapWithFixedAnchor(
      (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
        const target = transform.target
        const c1 = this.width * this.scaleX
        const rad = degToRad(this.angle)
        const a1 = c1 * Math.cos(rad) // 邻边 x
        const b1 = c1 * Math.sin(rad) // 对边 y

        // 旋转角
        const end = { x: this.left + a1, y: this.top + b1 }
        const angle = getAngleFromTwoPoints(x, y, end.x, end.y)

        // 求线的长度
        const a = end.x - x
        const b = end.y - y
        const c = Math.hypot(a, b) / target.scaleX

        this.set({
          width: c,
          angle
        }).setCoords()
        return true
      }
    )

    // 重写左右缩放逻辑
    this.controls.mr.actionHandler = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
      const target = transform.target
      // 旋转角
      const angle = getAngleFromTwoPoints(this.left, this.top, x, y)
      // 求线的长度
      const a = x - this.left
      const b = y - this.top
      const c = Math.hypot(a, b) / target.scaleX

      this.set({
        width: c,
        angle
      }).setCoords()
      console.warn(x, y)
      return true
    }
  }

  _render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()

    const start = { x: 0 - this.width / 2, y: 0 } as Point
    const end = { x: 0 + this.width / 2, y: 0 } as Point
    console.error(start, end)
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)

    ctx.lineWidth = this.strokeWidth
    const origStrokeStyle = ctx.strokeStyle
    ctx.strokeStyle = this.stroke as string
    if (this.stroke) {
      this._renderStroke(ctx)
    }

    ctx.strokeStyle = origStrokeStyle
  }
  // setCoords(): void {}
}

classRegistry.setClass(FLine, 'fline')
classRegistry.setSVGClass(FLine, 'fline')
