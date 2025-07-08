// todo 箭头，虚线；为线条单独设计一个样式设置界面 都是线条的一种类型
import {
  Canvas,
  classRegistry,
  FabricObject,
  type FabricObjectProps,
  Line,
  type ObjectEvents,
  Point,
  type SerializedObjectProps,
  type TOptions,
  type TPointerEvent,
  type Transform
} from 'fabric'
import { wrapWithFixedAnchor } from '../helper'

function getAngleFromTwoPoints(x1: number, y1: number, x2: number, y2: number): number {
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
  public static type = 'fline'
  //! 需要设置 left top width[线长] strokeWidth[线的厚度]
  constructor(options: Partial<Props> = {}) {
    // 必须设置strokeWidth
    // height 设置为0？
    super()
    Object.assign(this, Line.ownDefaults)
    this.setOptions({
      ...options,
      // strokeWidth 不能小于1
      // strokeWidth: options.strokeWidth ? (options.strokeWidth < 1 ? 1 : options.strokeWidth) : 1,
      height: options.height ? (options.height < 1 ? 1 : options.height) : 1,
      // 不跟随缩放，让 _getTransformedDimensions 计算 strokeWidth的值
      hasBorders: false,
      noScaleCache: false,
      strokeWidth: 0
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
      (_eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
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
    this.controls.mr.actionHandler = (_eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
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
      return true
    }
  }

  _render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()

    const tl = { x: 0 - this.width / 2, y: 0 - this.height / 2 } as Point
    const tr = { x: 0 + this.width / 2, y: 0 - this.height / 2 } as Point
    const bl = { x: 0 - this.width / 2, y: 0 + this.height / 2 } as Point
    const br = { x: 0 + this.width / 2, y: 0 + this.height / 2 } as Point
    ctx.moveTo(tl.x, tr.y)
    ctx.lineTo(tr.x, tr.y)
    ctx.lineTo(br.x, br.y)
    ctx.lineTo(bl.x, bl.y)
    ctx.closePath()
    const origFilltyle = ctx.fillStyle
    ctx.fillStyle = this.fill as string

    ctx.strokeStyle = this.stroke as string
    if (this.fill) {
      this._renderFill(ctx)
    }

    ctx.fillStyle = origFilltyle
  }

  // _set(key: string, value: any) {
  //   super._set(key, value)
  //   console.error(key)
  //   return this
  // }
  transform(ctx: CanvasRenderingContext2D) {
    if (this.group) {
      //! 使线条的scaleY 始终以1渲染；出组时也会与组的scaleY相乘，从而自动恢复为1
      this.scaleY = 1 / this.group.scaleY
    }
    // this.scaleY = 1
    const needFullTransform =
      (this.group && !this.group._transformDone) ||
      (this.group && this.canvas && ctx === (this.canvas as Canvas).contextTop)
    const m = this.calcTransformMatrix(!needFullTransform)
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])
  }
  // setCoords(): void {}
}

classRegistry.setClass(FLine, 'fline')
classRegistry.setSVGClass(FLine, 'fline')
