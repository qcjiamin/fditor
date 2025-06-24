import { fontWeightMap } from '@/utils/constants'
import type { FontStyle, FontWeight } from '@/utils/types'
import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
import { createLinearGradient, createRadialGradient, type colorVal } from '@fditor/core'
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
  // B 的逆矩阵
  const invertB = mat3.invert(mat3.create(), B)
  // B 的逆矩阵 * A 矩阵。 表示 A 坐标系-> 世界坐标系 -> B 坐标系的变化
  // 矩阵乘法是右乘先执行，所以先 A，再转成 B
  const delta = mat3.multiply(mat3.create(), invertB, A)
  const p = vec2.fromValues(pointInA.x, pointInA.y)
  // 将点A转换到B坐标系下
  const pInB = vec2.transformMat3(vec2.create(), p, delta)

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

/**
 * 渐变对象/颜色字符串 转换为自己定义的颜色信息
 * @param instance
 * @returns
 */
export function colorInstance2Info(instance: colorVal): ColorInfo {
  if (!instance) {
    return {
      type: 'solid',
      value: null
    }
  } else if (typeof instance === 'string') {
    return {
      type: 'solid',
      value: instance
    }
  } else {
    if (instance.type === 'linear') {
      const colors = instance.colorStops.map((val) => val.color)
      const units = instance.gradientUnits
      const degree = instance._degree
      return {
        type: 'gradient',
        value: {
          type: 'linear',
          colors,
          units,
          degree
        }
      }
    } else if (instance.type === 'radial') {
      const colors = instance.colorStops.map((val) => val.color)
      const units = instance.gradientUnits
      const percent = instance._percent
      return {
        type: 'gradient',
        value: {
          type: 'radial',
          colors,
          units,
          percent
        }
      }
    } else {
      throw new Error(`Unsupported gradient type`)
    }
  }
}

/**
 * 颜色信息+对象宽高转换为渐变颜色对象
 * @param info
 * @param width
 * @param height
 * @returns
 */
export function color2Instance(info: ColorInfo, width: number, height: number): colorVal {
  if (info.type === 'solid') {
    return info.value
  } else if (info.type === 'gradient') {
    const gradientInfo = info.value
    if (gradientInfo.type === 'linear') {
      return createLinearGradient(gradientInfo.units, gradientInfo.degree, width, height, ...gradientInfo.colors)
    } else if (gradientInfo.type === 'radial') {
      return createRadialGradient(gradientInfo.units, gradientInfo.percent, width, height, ...gradientInfo.colors)
    }
  }
  return null
}

export function createCssLinearGradient(angle = 0, ...colors: string[]) {
  return `linear-gradient(${angle}deg, ${colors.toString()})`
}

/**
 * 创建css表示的径向渐变
 * @param percent 浮点数，表示百分比
 * @param colors
 * @returns
 */
export function createCssRadialGradient(percent: number, ...colors: string[]) {
  return `radial-gradient(circle at ${percent * 100}% ${percent * 100}% ,${colors.toString()})`
}

/**
 * 加载指定字体
 * @param {string} family - 字体族名
 * @param {boolean} bold
 *  * @param {boolean} italic
 * @returns
 */
export async function loadFont(familyName: string, fileName: string, weight: FontWeight, style: FontStyle = 'normal') {
  // const href = 'https://static.vidnoz.com/web/fonts/'

  const weightNum = fontWeightMap[weight]
  const url = `http://localhost:7777/resource/ffonts/${fileName}`

  let needload = true
  document.fonts.forEach((value) => {
    if (value.family === familyName) {
      if (value.weight === weightNum.toString() && value.style === style) {
        needload = false
      }
    }
  })

  if (!needload) return
  const font = new FontFace(familyName, `url(${url})`, {
    weight: weightNum.toString(),
    style: style
  })
  document.fonts.add(font)
  await font
    .load()
    .then(() => {
      console.log(fileName, '字体加载完成')
    })
    .catch((err) => {
      console.log(fileName + ' 加载失败')
      console.log(err)
    })
}

export { add }
