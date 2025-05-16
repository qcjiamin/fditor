import { Canvas } from 'fabric'
// import { CanvasEvents } from 'fabric'

declare module 'fabric' {
  export interface Canvas {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eset(key: string, val: any, checkChnage?: boolean): void
  }
  // 扩展事件
  export interface CanvasEvents {
    'def:modified': { target: FabricObject | Canvas }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Canvas.prototype.eset = function (key: string, val: any, checkChnage: boolean = true) {
  //! colorPicker为例，鼠标down和up在同一位置，那么up时设置的颜色值与之前的相同，导致不会触发修改事件
  //! 但是有 commit 标记，eset 只会在up时触发，结果会导致无法触发修改事件
  const isChange = checkChnage ? this.get(key) !== val : true
  if (isChange) {
    this.set(key, val)
    this.fire('def:modified', { target: this })
  }
}
