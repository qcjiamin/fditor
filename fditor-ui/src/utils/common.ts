import { AbortReason } from '@/utils/constants'
import type { DefGradientOptions } from '@/utils/types'
import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
import {
  createLinearGradient,
  createRadialGradient,
  type colorVal,
  type LinearGradient,
  type RadialGradient
} from '@fditor/core'
import { Gradient } from 'fabric'
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
      const linearGradient = instance as LinearGradient
      const colors = linearGradient.colorStops.map((val) => val.color)
      const units = linearGradient.gradientUnits
      const degree = linearGradient._degree
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
      const radialGradient = instance as RadialGradient
      const colors = radialGradient.colorStops.map((val) => val.color)
      const units = radialGradient.gradientUnits
      const percent = radialGradient._percent
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
 * 根据配置创建线性渐变对象，并挂载 _degree 属性
 */
export async function createGradientFromObject(obj: DefGradientOptions<'linear'>): Promise<LinearGradient>

/**
 * 根据配置创建径向渐变对象，并挂载 _percent 属性
 */
export async function createGradientFromObject(obj: DefGradientOptions<'radial'>): Promise<RadialGradient>

/**
 * 根据配置创建渐变对象（线性或径向）
 */
export async function createGradientFromObject(
  obj: DefGradientOptions<'linear'> | DefGradientOptions<'radial'>
): Promise<LinearGradient | RadialGradient> {
  if (obj.type === 'linear') {
    const linearObj = obj as DefGradientOptions<'linear'>
    const gradient = (await Gradient.fromObject(linearObj)) as unknown as LinearGradient
    // 为线性渐变挂载 _degree 属性
    gradient._degree = linearObj._degree ?? 90
    return gradient
  } else {
    const radialObj = obj as DefGradientOptions<'radial'>
    const gradient = (await Gradient.fromObject(radialObj)) as unknown as RadialGradient
    // 为径向渐变挂载 _percent 属性
    gradient._percent = radialObj._percent ?? 0.5
    return gradient
  }
}

/**
 * 串行执行异步任务[特别是针对按钮触发的异步任务]，后一个任务执行需要等待前一个任务返回
 * @returns
 */
export function createTaskQueueRunner<T extends unknown[], R = void>() {
  let lastTask: Promise<R> = Promise.resolve() as Promise<R>

  return function enqueue(task: (...args: T) => Promise<R>, ...args: T) {
    // 将任务串接到上一个任务之后执行
    const current = lastTask.then(() => task(...args))
    // 防止链断（即某个任务失败导致队列中断）
    lastTask = current.catch(() => Promise.resolve() as Promise<R>)
    return current
  }
}

/**
 * 串行执行异步任务[特别是针对按钮触发的异步任务]，后一个任务执行时中断前一个任务并等待前一个任务完成。 抛出中断方法，使中断可由外部控制
 * @returns
 */
export function createAbortableTaskQueueRunner<T extends unknown[], R = void>() {
  let lastTask: Promise<R> = Promise.resolve() as Promise<R>
  let lastController: AbortController | null = null

  function abortTask(reason = 'cancel externally') {
    if (lastController && !lastController.signal.aborted) {
      lastController.abort(
        new Error(reason, {
          cause: AbortReason
        })
      )
    }
  }

  function enqueue(task: (signal: AbortSignal, ...args: T) => Promise<R>, ...args: T) {
    if (lastController) lastController.abort(new Error('', { cause: AbortReason }))

    // 创建当前任务的 AbortSignal
    const controller = new AbortController()
    const signal = controller.signal
    lastController = controller

    // 将任务串接到上一个任务之后执行
    const current = lastTask.then(() => task(signal, ...args))
    // 防止链断（即某个任务失败导致队列中断）
    lastTask = current.catch(() => Promise.resolve() as Promise<R>)
    return current
  }
  return {
    enqueue,
    abortTask
  }
}

export function getDefKey() {
  return Symbol()
}
/** 根据目标对象的 key，提取来源对象中相同的 key 和 value，返回新的对象 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMatchedObject = <T extends Record<string, any>, U extends Record<string, any>>(
  sourceObj: T,
  targetKeysObj: U
): Partial<T> => {
  const targetKeys = Object.keys(targetKeysObj)
  const result = {} as Partial<T>
  targetKeys.forEach((key) => {
    // 仅当 sourceObj 中存在该键时才赋值，避免 undefined
    if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(result as any)[key] = (sourceObj as any)[key]
    }
  })
  return result
}

export { add }
