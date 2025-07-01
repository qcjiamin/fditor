import { Gradient, Line } from 'fabric'

// 渐变保存自己的角度
Gradient.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude) {
    propertiesToInclude = (propertiesToInclude || []).concat(['_degree', '_percent'])
    return toObject.apply(this, [propertiesToInclude])
  }
})(Gradient.prototype.toObject)

Line.prototype._render = function (ctx) {
  ctx.beginPath()

  const p = this.calcLinePoints()
  console.log(p)
  ctx.moveTo(p.x1, p.y1)
  ctx.lineTo(p.x2, p.y2)

  ctx.lineWidth = this.strokeWidth

  // TODO: test this
  // make sure setting "fill" changes color of a line
  // (by copying fillStyle to strokeStyle, since line is stroked, not filled)
  const origStrokeStyle = ctx.strokeStyle
  // if (isFiller(this.stroke)) {
  //   ctx.strokeStyle = this.stroke.toLive(ctx)
  // } else {
  ctx.strokeStyle = this.stroke ?? ctx.fillStyle
  // }
  this.stroke && this._renderStroke(ctx)
  ctx.strokeStyle = origStrokeStyle
}
