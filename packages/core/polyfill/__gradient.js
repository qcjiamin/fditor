import { Gradient, Line, Rect } from 'fabric'

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

// Rect.prototype.isCacheDirty = function (skipCanvas = false) {
//   if (this.isNotVisible()) {
//     return false
//   }
//   const canvas = this._cacheCanvas
//   const ctx = this._cacheContext
//   if (canvas && ctx && !skipCanvas && this._updateCacheCanvas()) {
//     // in this case the context is already cleared.
//     return true
//   } else {
//     if (this.dirty || (this.clipPath && this.clipPath.absolutePositioned)) {
//       if (canvas && ctx && !skipCanvas) {
//         ctx.save()
//         ctx.setTransform(1, 0, 0, 1, 0, 0)
//         ctx.clearRect(0, 0, canvas.width, canvas.height)
//         ctx.restore()
//       }
//       return true
//     }
//   }
//   return false
// }

// Rect.prototype._render = function (ctx) {
//   const { width: w, height: h } = this
//   const x = -w / 2
//   const y = -h / 2
//   const rx = this.rx ? Math.min(this.rx, w / 2) : 0
//   const ry = this.ry ? Math.min(this.ry, h / 2) : 0
//   const isRounded = rx !== 0 || ry !== 0

//   ctx.beginPath()

//   ctx.moveTo(x + rx, y)

//   ctx.lineTo(x + w - rx, y)
//   isRounded && ctx.bezierCurveTo(x + w - kRect * rx, y, x + w, y + kRect * ry, x + w, y + ry)

//   ctx.lineTo(x + w, y + h - ry)
//   isRounded && ctx.bezierCurveTo(x + w, y + h - kRect * ry, x + w - kRect * rx, y + h, x + w - rx, y + h)

//   ctx.lineTo(x + rx, y + h)
//   isRounded && ctx.bezierCurveTo(x + kRect * rx, y + h, x, y + h - kRect * ry, x, y + h - ry)

//   ctx.lineTo(x, y + ry)
//   isRounded && ctx.bezierCurveTo(x, y + kRect * ry, x + kRect * rx, y, x + rx, y)

//   ctx.closePath()

//   this._renderPaintInOrder(ctx)
// }
