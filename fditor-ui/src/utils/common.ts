import { mat3, vec2 } from 'gl-matrix'
function add(a: number, b: number) {
  // const aa = 'abc'
  return a + b
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      reject('img load err')
    }
    img.src = src
  })
}

interface Point {
  x: number
  y: number
}

/**
 * 将坐标系原点转换为变换矩阵
 */
export function originToMat3(origin: Point) {
  return mat3.translate(mat3.create(), mat3.create(), vec2.fromValues(origin.x, origin.y))
}

export function switchPointFromCoordinateSystemAToB(A: mat3, B: mat3, pointInA: Point) {
  const invertB = mat3.invert(mat3.create(), B)
  const delta = mat3.multiply(mat3.create(), invertB, A)
  const p = vec2.fromValues(pointInA.x, pointInA.y)
  const pInB = vec2.transformMat3(vec2.create(), p, delta)
  // const pointInB
  return { x: pInB[0], y: pInB[1] }
}

/**
 * 保留浮点数后几位小数点
 * @param num 浮点数
 * @param {number} [fractionDigits=2] 保留位数, default: 2
 */
export function _toFixed(num: number, fractionDigits: number = 2) {
  return Number(num.toFixed(fractionDigits))
}

export { add }
