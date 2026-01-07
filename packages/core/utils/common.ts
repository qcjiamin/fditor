import { NormalPoint } from '@fditor/core'

/** 
 获取工作区按照容器宽高缩放度
 @param destination 工作区比例
 @param source 容器当前宽高
 */
export function findScaleToFit(
  source: { width: number; height: number },
  destination: { width: number; height: number }
) {
  return Math.min(destination.width / source.width, destination.height / source.height)
}

/**
 * Removes value from an array.
 * Presence of value (and its position in an array) is determined via `Array.prototype.indexOf`
 * from Fabric.js
 * @param {Array} array
 * @param {*} value
 * @return {Array} original array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeFromArray = (array: any[], value: any) => {
  const idx = array.indexOf(value)
  if (idx !== -1) {
    array.splice(idx, 1)
  }
  return array
}

/**
 * 判断当前是否火狐浏览器
 * @returns
 */
export function isFirefox() {
  return navigator.userAgent.indexOf('Firefox') > -1
}

/** 求C相对于AB的中垂线的对称点 */
export function mirrorPointByMidPerpendicular(A: NormalPoint, B: NormalPoint, C: NormalPoint) {
  const dx = B.x - A.x
  const dy = B.y - A.y

  const mx = (A.x + B.x) / 2
  const my = (A.y + B.y) / 2

  const t = ((C.x - mx) * dx + (C.y - my) * dy) / (dx * dx + dy * dy)

  return {
    x: C.x - 2 * t * dx,
    y: C.y - 2 * t * dy
  }
}

type Point = NormalPoint
// 获取角的初始handle点。 ABC形成的较小角的角平分线的垂线，然后求BA、BC的1/3在垂线上的投影。兼容共线的情况
export function computeProjectionsSafe(A: Point, B: Point, C: Point) {
  function add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y }
  }

  function sub(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y }
  }

  function scale(v: Point, s: number): Point {
    return { x: v.x * s, y: v.y * s }
  }

  function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y
  }

  function length(v: Point): number {
    return Math.hypot(v.x, v.y)
  }

  function normalize(v: Point): Point {
    const len = length(v)
    if (len === 0) throw new Error('Zero-length vector')
    return { x: v.x / len, y: v.y / len }
  }

  function cross(a: Point, b: Point): number {
    return a.x * b.y - a.y * b.x
  }

  /**
   * 点 P 在过点 B、方向为 dir 的直线上的投影
   */
  function projectPointToLine(P: Point, B: Point, dir: Point): Point {
    const t = dot(sub(P, B), dir)
    return add(B, scale(dir, t))
  }

  const BA = sub(A, B)
  const BC = sub(C, B)

  const lenBA = length(BA)
  const lenBC = length(BC)

  if (lenBA === 0 || lenBC === 0) {
    throw new Error('A or C coincides with B')
  }

  const BAu = scale(BA, 1 / lenBA)
  const BCu = scale(BC, 1 / lenBC)

  // 共线判断
  const EPS = 1e-8
  const collinear = Math.abs(cross(BA, BC)) < EPS

  let perpDir: Point

  if (collinear) {
    // 退化情况：直接用 BA 的法线
    perpDir = normalize({
      x: -BAu.y,
      y: BAu.x
    })
  } else {
    // 正常情况：角平分线 → 垂线
    const bisector = normalize(add(BAu, BCu))
    perpDir = normalize({
      x: -bisector.y,
      y: bisector.x
    })
  }

  // A1 / C1
  const A1 = add(B, scale(BAu, lenBA / 3))
  const C1 = add(B, scale(BCu, lenBC / 3))

  // 投影
  const A1Proj = projectPointToLine(A1, B, perpDir)
  const C1Proj = projectPointToLine(C1, B, perpDir)

  return { handleA: A1Proj, handleB: C1Proj }
}
