import { StaticCanvas } from 'fabric'
StaticCanvas.prototype._renderBackgroundOrOverlay = function (ctx, property) {
  const fill = this[property + 'Color'],
    object = this[property + 'Image'],
    v = this.viewportTransform,
    needsVpt = this[property + 'Vpt']
  if (!fill && !object) {
    return
  }
  //! polifill: 在背景色下面，先绘制一层垫片颜色,理论上应该只支持纯色黑OR白
  if (property === 'background') {
    const podFill = this.padColor ?? 'rgba(0,0,0,1)'
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(this.width, 0)
    ctx.lineTo(this.width, this.height)
    ctx.lineTo(0, this.height)
    ctx.closePath()
    ctx.fillStyle = podFill
    ctx.fill()
    ctx.restore()
  }

  if (fill) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(this.width, 0)
    ctx.lineTo(this.width, this.height)
    ctx.lineTo(0, this.height)
    ctx.closePath()
    ctx.fillStyle = fill.toLive ? fill.toLive(ctx, this) : fill
    if (needsVpt) {
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
    }
    ctx.transform(1, 0, 0, 1, fill.offsetX || 0, fill.offsetY || 0)
    const m = fill.gradientTransform || fill.patternTransform
    m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])
    ctx.fill()
    ctx.restore()
  }
  if (object) {
    ctx.save()
    if (needsVpt) {
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
    }
    object.render(ctx)
    ctx.restore()
  }
}
