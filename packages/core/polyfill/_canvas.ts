import { Canvas } from 'fabric'
// import { CanvasEvents } from 'fabric'

declare module 'fabric' {
  export interface Canvas {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eset(key: string, val: any, checkChnage?: boolean): void
    getObjectByZIndex(idx: number): FabricObject | null
    insertBefore(obj: FabricObject, desObj: FabricObject | null): Canvas
    _add(...objs: FabricObject[]): Canvas
    _remove(...objs: FabricObject[]): Canvas
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

Canvas.prototype.getObjectByZIndex = function (idx) {
  return this.getObjects().find((obj) => obj.getZIndex() === idx) || null
}

Canvas.prototype.insertBefore = function (obj, desObj) {
  const objects = this._objects
  if (!desObj) {
    objects.push(obj)
  } else {
    const idx = desObj.getZIndex()
    objects.splice(idx, 0, obj)
  }
  obj.set('canvas', this)
  obj.setCoords()
  this._onObjectAdded(obj)

  if (this.renderOnAddRemove) {
    this.requestRenderAll()
  }
  return this
}

// 添加，无事件触发版本
Canvas.prototype._add = function (...objs) {
  this._objects.push(...objs)
  // if (this._onObjectAddedDef) {
  //   for (let i = 0, length = arguments.length; i < length; i++) {
  //     arguments[i]._set('canvas', this)
  //     arguments[i].setCoords()
  //     this._onObjectAddedDef(arguments[i])
  //   }
  // }
  if (this.renderOnAddRemove) {
    this.requestRenderAll()
  }
  return this
}

// 删除，无事件触发版本
Canvas.prototype._remove = function (...objs) {
  const objects = this._objects
  let index
  let somethingRemoved = false

  for (let i = 0, length = objs.length; i < length; i++) {
    index = objects.indexOf(objs[i])

    // only call onObjectRemoved if an object was actually removed
    if (index !== -1) {
      somethingRemoved = true
      objects.splice(index, 1)
      // this._onObjectRemoved && this._onObjectRemoved(arguments[i])
    }
  }

  if (this.renderOnAddRemove && somethingRemoved) {
    this.requestRenderAll()
  }

  return this
}
