import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eset(key: string, val: any): void
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
FabricObject.prototype.eset = function (key: string, val: any) {
  const isChange = this.get(key) !== val
  if (isChange) {
    this.set(key, val)
    // 都从canvas触发，方便监听
    this.canvas!.fire('def:modified', this)
  }
}
