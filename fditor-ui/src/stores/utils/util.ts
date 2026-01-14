// src/fabric/utils/fabricUtil.js ✅ 纯工具函数，无组合式调用
import { isGradient } from '@/utils/typeHelper'
import { type FCanvas, type LinearGradient, type RadialGradient } from '@fditor/core'
import { classRegistry, FabricObject } from 'fabric'
import { cloneDeep } from 'lodash'

// 画布校验 → 入参传入canvas，不再内部调用store
export const isCanvasReady = (canvas: FCanvas) => {
  if (!canvas) {
    console.error('画布未初始化，操作失败')
    return false
  }
  return true
}

// 元素校验 → 入参传入canvas和obj
export const isElementValid = (obj: FabricObject, canvas: FCanvas) => {
  if (!obj || typeof obj.set !== 'function' || !obj.id) return false
  const isObjInCanvas = canvas.getObjects().some((item) => item.id === obj.id)
  return isObjInCanvas
}

/** 将对象的属性序列化 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serializeFabricValue = async (value: any): Promise<any> => {
  if (value === null || value === undefined) return value

  // 1. 如果对象自带 toObject 方法（Fabric 对象的标准行为）
  if (typeof value === 'object' && typeof value.toObject === 'function') {
    return value.toObject()
  }

  // 2. 处理数组（如 strokeDashArray, points）
  if (Array.isArray(value)) {
    return await Promise.all(value.map((item) => serializeFabricValue(item)))
  }

  // 3. 处理普通对象
  if (typeof value === 'object') {
    return cloneDeep(value)
  }
  // 4. 默认处理：返回原始值
  return value
}

/** 活化对象 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activateObject = async (value: any): Promise<any> => {
  if (value === null || value === undefined) return value
  // 1. 处理序列化的对象
  /** 是序列化的fabric对象 */
  const isSerializeObj = value.type && classRegistry.getClass(value.type)
  if (isSerializeObj) {
    const klass = classRegistry.getClass(value.type) as typeof FabricObject
    if (klass) {
      const instance = await klass.fromObject(value)
      // 不同对象的特殊处理
      if (isGradient(instance)) {
        if (instance.type === 'linear') {
          //? w=为什么用 as unknown as？ 对象.fill 时Gradient类型的，但这里需要其为扩展类型，扩展类型无法直接断言为基类
          ;(instance as unknown as LinearGradient)._degree = value._degree
        } else if (instance.type === 'radial') {
          ;(instance as unknown as RadialGradient)._percent = value._percent
        }
      }
      return instance
    }
  }

  // 2. 处理数组（如 strokeDashArray, points）
  if (Array.isArray(value)) {
    return await Promise.all(value.map((item) => activateObject(item)))
  }
  // 3. 处理普通对象
  if (typeof value === 'object') {
    return cloneDeep(value)
  }
  // 4. 默认处理：返回原始值
  return value
}
