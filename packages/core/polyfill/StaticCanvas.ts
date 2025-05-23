import { Canvas, StaticCanvas } from 'fabric'
// import { CanvasEvents } from 'fabric'

declare module 'fabric' {
  export interface StaticCanvas {
    getObjectByZIndex(idx: number): FabricObject | null
    insertBefore(obj: FabricObject, desObj: FabricObject | null): StaticCanvas
    _add(...objs: FabricObject[]): StaticCanvas
    _remove(...objs: FabricObject[]): StaticCanvas
  }
  // 扩展事件
  export interface CanvasEvents {
    'def:modified': { target: FabricObject | Canvas }
  }
}

StaticCanvas.prototype.getObjectByZIndex = function (idx) {
  return this.getObjects().find((obj) => obj.getZIndex() === idx) || null
}

StaticCanvas.prototype.insertBefore = function (obj, desObj) {
  const objects = this._objects
  if (!desObj) {
    objects.push(obj)
  } else {
    const idx = desObj.getZIndex()
    objects.splice(idx, 0, obj)
  }
  obj._set('canvas', this)
  obj.setCoords()
  // this._onObjectAdded(obj)

  if (this.renderOnAddRemove) {
    this.requestRenderAll()
  }
  return this
}

// 添加，无事件触发版本
StaticCanvas.prototype._add = function (...objs) {
  this._objects.push(...objs)
  objs.forEach((obj) => {
    obj.canvas = this as Canvas
    obj.setCoords()
  })
  if (this.renderOnAddRemove) {
    this.requestRenderAll()
  }
  return this
}

// 删除，无事件触发版本
StaticCanvas.prototype._remove = function (...objs) {
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
