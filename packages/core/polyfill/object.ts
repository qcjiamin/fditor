/* eslint-disable @typescript-eslint/no-explicit-any */
import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    eset(key: string, val: any, checkChange?: boolean): void

    eset(props: Record<string, any>, checkChnage?: boolean): void
  }
}

FabricObject.prototype.eset = function (
  keyOrProps: string | Record<string, any>,
  val?: any,
  checkChange: boolean = true
) {
  let changed = false

  if (typeof keyOrProps === 'string') {
    const oldVal = this.get(keyOrProps)
    if (oldVal !== val) {
      this.set(keyOrProps, val)
      changed = true
    }
  } else {
    for (const key in keyOrProps) {
      const oldVal = this.get(key)
      const newVal = keyOrProps[key]
      if (oldVal !== newVal) {
        this.set(key, newVal)
        changed = true
      }
    }
  }
  if (!checkChange) changed = true
  if (changed) {
    this.canvas?.fire('def:modified', { target: this })
  }
}
