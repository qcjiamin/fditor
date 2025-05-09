import { Canvas } from 'fabric'

declare module 'fabric' {
  export interface Canvas {
    _setBgImage(url: string): void
  }
}

Canvas.prototype._setBgImage = function (url: string) {
  console.log('_setBgImage', url)
  // 设置背景并自适应
}
