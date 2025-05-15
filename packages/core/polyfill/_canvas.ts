import { Canvas } from 'fabric'
// import { CanvasEvents } from 'fabric'

declare module 'fabric' {
  export interface Canvas {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eset(key: string, val: any): void
  }
  // 扩展事件
  export interface CanvasEvents {
    'def:modified': FabricObject | Canvas
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Canvas.prototype.eset = function (key: string, val: any) {
  const isChange = this.get(key) !== val
  if (isChange) {
    this.set(key, val)
    this.fire('def:modified', this)
  }
}
