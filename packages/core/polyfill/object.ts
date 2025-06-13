/* eslint-disable @typescript-eslint/no-explicit-any */
import { HorizontalAlign, VerticalAlign } from '@kditor/core'
import { FabricObject, Point, TOriginX, TOriginY } from 'fabric'
import { workerData } from 'worker_threads'

declare module 'fabric' {
  export interface FabricObject {
    eset(key: string, val: any, checkChange?: boolean): void
    eset(props: Record<string, any>, checkChnage?: boolean): void
    getZIndex(): number
    getNext(): FabricObject | null
    getAlign(): { h: HorizontalAlign | ''; v: VerticalAlign | '' }
    setAlign(align: HorizontalAlign | VerticalAlign): void
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
  if (changed && this.canvas) {
    // 设置定位或宽高之类的属性，需要重新计算范围矩阵
    this.setCoords()
    this.canvas.fire('def:modified', { target: this })
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

FabricObject.prototype.getAlign = function () {
  let h: HorizontalAlign | '' = ''
  let v: VerticalAlign | '' = ''
  if (!this.canvas)
    return {
      h,
      v
    }
  const rect = this.getBoundingRect()
  const wrokspace = {
    w: this.canvas.clipPath ? this.canvas.clipPath.width : this.canvas.width * this.canvas.getZoom(),
    h: this.canvas.clipPath ? this.canvas.clipPath.height : this.canvas.height * this.canvas.getZoom()
  }
  if (rect.left === 0) h = 'left'
  if (rect.left + rect.width / 2 === wrokspace.w / 2) h = 'center'
  if (rect.left + rect.width === wrokspace.w) h = 'right'
  if (rect.top === 0) v = 'top'
  if (rect.top + rect.height / 2 === wrokspace.h / 2) v = 'middle'
  if (rect.top + rect.height === wrokspace.h) v = 'bottom'

  return {
    h,
    v
  }
}

FabricObject.prototype.setAlign = function (align) {
  if (!this.canvas) return
  const rect = this.getBoundingRect()
  switch (align) {
    case 'left': {
      const _left = this.left - rect.left
      this.eset('left', _left)
      break
    }
    case 'center': {
      this.canvas.viewportCenterObjectH(this)
      this.canvas.fire('def:modified', { target: this })

      break
    }
    case 'right': {
      const rightPoint = new Point(this.canvas.width, 0)
      const vpRight = rightPoint.transform(this.canvas.viewportTransform)
      if (this.canvas.clipPath) {
        vpRight.x = this.canvas.clipPath.width
      }
      // 备份当前top, 因为setPositionByOrigin会使top发生变化，即使origin是'top'
      const _top = this.top
      const to = new Point(vpRight.x, this.top)
      this.setPositionByOrigin(to, 'right', 'top')
      this.set('top', _top)
      this.setCoords()
      this.canvas.fire('def:modified', { target: this })

      break
    }
    case 'top': {
      const _top = this.top - rect.top
      this.eset('top', _top)
      break
    }
    case 'middle': {
      this.canvas.viewportCenterObjectV(this)
      this.canvas.fire('def:modified', { target: this })

      break
    }
    case 'bottom': {
      const bottomPoint = new Point(0, this.canvas.height)
      const vpBottom = bottomPoint.transform(this.canvas.viewportTransform)
      if (this.canvas.clipPath) {
        vpBottom.y = this.canvas.clipPath.height
      }

      this.top = vpBottom.y - this.getBoundingRect().height
      this.setCoords()
      this.canvas.fire('def:modified', { target: this })
      break
    }
    default:
      break
  }
}
