import { Path, Point, TRectBounds, util } from 'fabric'

export function getBoundsOfQuadraticCurve(
  begx: number,
  begy: number,
  cpx: number,
  cpy: number,
  endx: number,
  endy: number
): TRectBounds {
  // let argsString: string
  // if (config.cachesBoundsOfCurve) {
  //   // eslint-disable-next-line
  //   argsString = [...arguments].join();
  //   if (cache.boundsOfCurveCache[argsString]) {
  //     return cache.boundsOfCurveCache[argsString];
  //   }
  // }

  const eps = 1e-12

  let minX = Math.min(begx, endx)
  let maxX = Math.max(begx, endx)
  let minY = Math.min(begy, endy)
  let maxY = Math.max(begy, endy)

  // ===== x 方向极值 =====
  let denom = begx - 2 * cpx + endx
  if (Math.abs(denom) > eps) {
    const t = (begx - cpx) / denom
    if (t > 0 && t < 1) {
      const mt = 1 - t
      const x = mt * mt * begx + 2 * mt * t * cpx + t * t * endx
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
    }
  }

  // ===== y 方向极值 =====
  denom = begy - 2 * cpy + endy
  if (Math.abs(denom) > eps) {
    const t = (begy - cpy) / denom
    if (t > 0 && t < 1) {
      const mt = 1 - t
      const y = mt * mt * begy + 2 * mt * t * cpy + t * t * endy
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }

  const result: TRectBounds = [new Point(minX, minY), new Point(maxX, maxY)]

  // if (config.cachesBoundsOfCurve) {
  //   cache.boundsOfCurveCache[argsString!] = result;
  // }

  return result
}

export interface XY {
  x: number
  y: number
}
type TSize = {
  width: number
  height: number
}
type TBBox = {
  left: number
  top: number
} & TSize

Path.prototype._calcBoundsFromPath = function (): TBBox {
  const bounds: XY[] = []
  let subpathStartX = 0,
    subpathStartY = 0,
    x = 0, // current x
    y = 0 // current y

  for (const command of this.path) {
    // current instruction
    switch (
      command[0] // first letter
    ) {
      case 'L': // lineto, absolute
        x = command[1]
        y = command[2]
        bounds.push({ x: subpathStartX, y: subpathStartY }, { x, y })
        break

      case 'M': // moveTo, absolute
        x = command[1]
        y = command[2]
        subpathStartX = x
        subpathStartY = y
        break

      case 'C': // bezierCurveTo, absolute
        bounds.push(
          ...util.getBoundsOfCurve(x, y, command[1], command[2], command[3], command[4], command[5], command[6])
        )
        x = command[5]
        y = command[6]
        break

      case 'Q': // quadraticCurveTo, absolute
        bounds.push(
          //! fabric 本身求曲线范围只支持三次贝塞尔曲线，二次贝塞尔曲线会留有空白
          //! 这里修复这个问题
          ...getBoundsOfQuadraticCurve(x, y, command[1], command[2], command[3], command[4])
        )
        x = command[3]
        y = command[4]
        break

      case 'Z':
        x = subpathStartX
        y = subpathStartY
        break
    }
  }
  return util.makeBoundingBoxFromPoints(bounds)
}
