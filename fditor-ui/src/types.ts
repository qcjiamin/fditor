export interface ImageInfo {
  src: string
  title: string
  width: number
  height: number
}

/** 画布操作状态 */
export type CanvasMode = 'move' | 'pencil' | 'pen'
