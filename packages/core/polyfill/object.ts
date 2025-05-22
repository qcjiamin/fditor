/* eslint-disable @typescript-eslint/no-explicit-any */
import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    eset(key: string, val: any, checkChange?: boolean): void

    eset(props: Record<string, any>, checkChnage?: boolean): void
    getZIndex(): number
    getNext(): FabricObject | null
  }
}

FabricObject.prototype.eset = function (
  keyOrProps: string | Record<string, any>,
  valOrCheckChange?: any,
  checkChange: boolean = true
) {
  let changed = false

  if (typeof keyOrProps === 'string') {
    const oldVal = this.get(keyOrProps)
    if (oldVal !== valOrCheckChange) {
      this.set(keyOrProps, valOrCheckChange)
      changed = true
    }
    changed = checkChange ? changed : true
  } else {
    for (const key in keyOrProps) {
      const oldVal = this.get(key)
      const newVal = keyOrProps[key]
      if (oldVal !== newVal) {
        this.set(key, newVal)
        changed = true
      }
    }
    changed = valOrCheckChange ? changed : true
  }
  if (changed) {
    this.canvas?.fire('def:modified', { target: this })
  }
}

FabricObject.prototype.getZIndex = function () {
  if (!this.canvas) throw new Error('getzIndex but no canvas')
  return this.canvas.getObjects().indexOf(this)
}

FabricObject.prototype.getNext = function () {
  if (!this.canvas) throw new Error('getzIndex but no canvas')
  const zidx = this.getZIndex()
  const nextObj = this.canvas.getObjectByZIndex(zidx + 1)
  return nextObj
}
