import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eset(key: string, val: any): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eset(props: Record<string, any>): void
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
FabricObject.prototype.eset = function (keyOrProps: string | Record<string, any>, val?: any) {
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

  if (changed) {
    this.canvas?.fire('def:modified', { target: this })
  }
}
