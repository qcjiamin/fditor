import { Point, util } from 'fabric'
import type { TMat2D } from 'fabric'

/**
 * 将A坐标系的点转换为B坐标系的点
 * @param A
 * @param B
 * @param pointInA
 * @returns
 */
export function switchPointFromCoordinateSystemAToB(A: TMat2D, B: TMat2D, pointInA: Point) {
  // B 的逆矩阵
  const invertB = util.invertTransform(B)
  // B 的逆矩阵 * A 矩阵。 表示 A 坐标系-> 世界坐标系 -> B 坐标系的变化
  // 矩阵乘法是右乘先执行，所以先 A，再转成 B
  const delta = util.multiplyTransformMatrices(invertB, A)
  // 将点A转换到B坐标系下
  const pInB = pointInA.transform(delta)
  return pInB
}

/**
 * 将子坐标系坐标转换为父坐标系坐标
 * @param A
 * @param B
 * @param pointInA
 * @returns
 */
export function switchPointFromLocalToContainer(A: TMat2D, B: TMat2D, pointInA: Point) {
  const delta = util.multiplyTransformMatrices(B, A)
  // 将点A转换到B坐标系下
  const pInB = pointInA.transform(delta)
  return pInB
}

/**
 * 将父坐标系坐标转换为子坐标系坐标
 * @param matrixLocal
 * @param pointInContainer
 * @returns
 */
export function switchPointFromContainerToLocal(matrixLocal: TMat2D, pointInContainer: Point): Point {
  const invertLocal = util.invertTransform(matrixLocal)
  return pointInContainer.transform(invertLocal)
}
