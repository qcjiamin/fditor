import { LinearGradient, RadialGradient } from '@kditor/core'
import { Gradient, GradientUnits } from 'fabric'
window.Gradient = Gradient

// 百分比点位计算，暂时没有用到,待测试
export function computeGradientPercentageCoords(angleDeg: number) {
  const angleRad = ((angleDeg % 360) * Math.PI) / 180

  const dx = Math.cos(angleRad)
  const dy = Math.sin(angleRad)

  // 中心点为 (0.5, 0.5)，从中心出发沿方向 dx/dy 延伸到边界
  const half = Math.sqrt(2) / 2 // 半对角线最大长度

  return {
    x1: 0.5 - dx * half,
    y1: 0.5 - dy * half,
    x2: 0.5 + dx * half,
    y2: 0.5 + dy * half
  }
}

/**
 * 计算指定角度的线性渐变起点和终点
 * @description 有缺陷，计算的结果会超出一部分
 */
export function computeGradientPoints(width: number, height: number, angleDeg: number) {
  const angleRad = ((angleDeg % 360) * Math.PI) / 180

  // 方向向量 (dx, dy)
  const dx = Math.cos(angleRad)
  const dy = Math.sin(angleRad)

  // 找到最长可以画到矩形对角线的范围
  const halfDiagonal = Math.sqrt(width ** 2 + height ** 2) / 2

  // 中心点
  const cx = width / 2
  const cy = height / 2

  // 起点、终点
  const x1 = cx - dx * halfDiagonal
  const y1 = cy - dy * halfDiagonal
  const x2 = cx + dx * halfDiagonal
  const y2 = cy + dy * halfDiagonal

  return { x1, y1, x2, y2 }
}

/**
 * 计算固定角度的线性渐变起点和终点  90 180 135
 */
export function computedGradientPointsFixed(width: number, height: number, angleDeg: number) {
  if (angleDeg === 90) {
    return {
      x1: 0,
      y1: 0,
      x2: width,
      y2: 0
    }
  } else if (angleDeg === 180) {
    // 理论上180应该是从下到上，这里处理成从上到下（参考canva）
    return {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: height
    }
  } else if (angleDeg === 135) {
    return {
      x1: 0,
      y1: 0,
      x2: width,
      y2: height
    }
  }
}

/**
 * 创建渐变对象
 * @param units 渐变坐标计算方式
 * @param angle 角度
 * @param width 使用渐变的对象的宽
 * @param height 使用渐变的对象的高
 * @param colors 颜色值s
 * @returns
 */
export function createLinearGradient(
  units: GradientUnits = 'pixels',
  angle: number,
  width: number,
  height: number,
  ...colors: string[]
) {
  const step = 1 / colors.length
  const colorStops = colors.map((color, index) => {
    return { offset: index === colors.length - 1 ? 1 : index * step, color }
  })
  const coords = computedGradientPointsFixed(width, height, angle)
  const gradient = new Gradient<'linear'>({
    type: 'linear',
    gradientUnits: units, // or 'percentage'
    coords: coords,
    colorStops
  }) as LinearGradient
  gradient._degree = angle
  return gradient
}

/**
 * 创建径向渐变对象
 * @param units 渐变坐标计算方式
 * @param percent 渐变的中心点，按百分比计算
 * @param width 使用渐变的对象的宽
 * @param height 使用渐变的对象的高
 * @param colors 颜色值s
 * @returns
 */
export function createRadialGradient(
  units: GradientUnits = 'pixels',
  percent: number,
  width: number,
  height: number,
  ...colors: string[]
) {
  const step = 1 / colors.length
  const colorStops = colors.map((color, index) => {
    return { offset: index === colors.length - 1 ? 1 : index * step, color }
  })
  const maxLen = Math.max(width, height)
  const x = width * percent
  const y = height * percent
  const coords = {
    r1: 0, // 该属性仅径向渐变可用，外圆半径
    r2: maxLen ? maxLen / 2 : 1, // 该属性仅径向渐变可用，外圆半径
    // x1: width ? width / 2 : 0.5, // 焦点的x坐标
    // y1: height ? height / 2 : 0.5, // 焦点的y坐标
    // x2: width ? width / 2 : 0.5, // 中心点的x坐标
    // y2: height ? height / 2 : 0.5 // 中心点的y坐标
    x1: x, // 焦点的x坐标
    y1: y, // 焦点的y坐标
    x2: x, // 中心点的x坐标
    y2: y // 中心点的y坐标
  }

  const gradient = new Gradient<'radial'>({
    type: 'radial',
    gradientUnits: units,
    coords,
    colorStops
  }) as RadialGradient

  gradient._percent = percent
  return gradient
}
