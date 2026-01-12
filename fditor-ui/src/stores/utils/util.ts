// src/fabric/utils/fabricUtil.js ✅ 纯工具函数，无组合式调用
import type { FCanvas } from '@fditor/core'
import { FabricObject } from 'fabric'

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

export function cloneValue<T>(value: T): T {
  if (value == null) return value
  if (typeof value !== 'object') return value

  // 数组类型，序列化
  if (Array.isArray(value)) {
    return value.map(cloneValue) as T
  }

  // Fabric filter / shadow 等, 使用单独的方法
  if ('toObject' in value) {
    throw new Error('cloneValue: value is object')
  }

  return JSON.parse(JSON.stringify(value))
}
