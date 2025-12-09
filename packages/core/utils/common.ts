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
