/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HorizontalAlign, VerticalAlign } from '@fditor/core'
import { FabricObject, Point } from 'fabric'
import { isActiveSelection } from '../utils/typeAssertions'
import { removeFromArray } from '../utils/common'
import { v4 as uuidv4 } from 'uuid'

declare module 'fabric' {
  export interface FabricObject {
    cornerStyle: 'rect' | 'circle' | 'img'
    eset(key: string, val: any, checkChange?: boolean): void
    eset(props: Record<string, any>, checkChnage?: boolean): void
    getZIndex(): number
    getNext(): FabricObject | null
    getAlign(): { h: HorizontalAlign | ''; v: VerticalAlign | '' }
    setAlign(align: HorizontalAlign | VerticalAlign): void
    bringToFront(): void
    bringForward(): void
    sendToBack(): void
    sendBackwards(): void
  }
}

/** 重写FabricObject 构造函数一定会调用的setOptions, 让对象在构造时默认添加id 属性；
 * 由于其本身是protected方法，因此转为any来绕过ts检测
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore or cast to any to access protected method
const originalSetOptions = (FabricObject.prototype as any).setOptions
;(FabricObject.prototype as any).setOptions = function (options: Record<string, any>) {
  // Call original method
  originalSetOptions.call(this, options)

  // Auto-generate ID if missing
  if (!this.id) {
    this.id = uuidv4()
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
  console.error('align obje')
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
FabricObject.prototype.bringToFront = function () {
  if (!this.canvas) return
  if (isActiveSelection(this)) {
    const objects = this.getObjects()
    for (const obj of objects) {
      this.canvas.bringObjectToFront(obj)
    }
  } else {
    this.canvas.bringObjectToFront(this)
  }
  this.canvas.fire('def:modified', { target: this })
}
FabricObject.prototype.bringForward = function () {
  if (!this.canvas) return
  if (isActiveSelection(this)) {
    // 找到最高层级的对象， 以它为标准，全部向上移动
    const objects = this.getObjects()
    const topObj = objects[objects.length - 1]
    const topZIdx = topObj.getZIndex()
    const topObjIsInTop = topZIdx === this.canvas.getObjects().length - 1
    if (!topObjIsInTop) {
      // 将最高层级对象向上移动一层，然后把其他对象依此放到它下面
      this.canvas.bringObjectForward(topObj)
    }
    const otherObjs = objects.slice(0, objects.length - 1)
    const allObjs = this.canvas._objects
    for (const obj of otherObjs) {
      removeFromArray(allObjs, obj)
    }
    // 找到topObj的新位置
    const newTopZIdx = topObj.getZIndex()
    this.canvas._objects.splice(newTopZIdx, 0, ...otherObjs)
  } else {
    this.canvas.bringObjectForward(this)
  }
  this.canvas.fire('def:modified', { target: this })
}
FabricObject.prototype.sendToBack = function () {
  if (!this.canvas) return
  if (isActiveSelection(this)) {
    const objects = this.getObjects()
    for (let i = objects.length - 1; i >= 0; i--) {
      this.canvas.sendObjectToBack(objects[i])
    }
  } else {
    this.canvas.sendObjectToBack(this)
  }
  this.canvas.fire('def:modified', { target: this })
}
FabricObject.prototype.sendBackwards = function () {
  console.log('send backwards')
  if (!this.canvas) return
  if (isActiveSelection(this)) {
    // 找到最低层级的对象， 以它为标准，全部向下移动
    const objects = this.getObjects()
    const bottomObj = objects[0]
    const bottomZIdx = bottomObj.getZIndex()
    const bottomObjIsInBottom = bottomZIdx === 0
    if (!bottomObjIsInBottom) {
      // 将最低层级对象向下移动一层，然后把其他对象依此放到它上面
      this.canvas.sendObjectBackwards(bottomObj)
    }
    const otherObjs = objects.slice(1)
    const allObjs = this.canvas._objects
    for (const obj of otherObjs) {
      removeFromArray(allObjs, obj)
    }
    // 找到bottomObj的新位置
    const newBottomZIdx = bottomObj.getZIndex()
    this.canvas._objects.splice(newBottomZIdx + 1, 0, ...otherObjs)
  } else {
    this.canvas.sendObjectBackwards(this)
  }
  this.canvas.fire('def:modified', { target: this })
}
