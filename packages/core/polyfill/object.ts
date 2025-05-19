/* eslint-disable @typescript-eslint/no-explicit-any */
import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    eset(key: string, val: any, checkChange: boolean): void

    eset(props: Record<string, any>, checkChnage?: boolean): void
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
