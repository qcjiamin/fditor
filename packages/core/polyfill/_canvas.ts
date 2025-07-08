/**
 * 功能方法废弃，画布对象改用继承
 * 事件任然正常使用
 */

import { Canvas } from 'fabric'
import { ClipFrame } from '../customShape/ClipFrame'
// import { CanvasEvents } from 'fabric'

declare module 'fabric' {
  // export interface Canvas {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   eset(key: string, val: any, checkChnage?: boolean): void
  //   getObjectByZIndex(idx: number): FabricObject | null
  //   _insertBefore(obj: FabricObject, desObj: FabricObject | null): Canvas
  //   _add(...objs: FabricObject[]): Canvas
  //   _remove(...objs: FabricObject[]): Canvas
  //   /** 删除选中的元素 */
  //   _removeSelected(): FabricObject | FabricObject[] | null
  // }
  // 扩展事件
  export interface CanvasEvents {
    'def:modified': { target: FabricObject | Canvas }
    'confirm:clip': ClipFrame
  }
}

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// Canvas.prototype.eset = function (key: string, val: any, checkChnage: boolean = true) {
//   //! colorPicker为例，鼠标down和up在同一位置，那么up时设置的颜色值与之前的相同，导致不会触发修改事件
//   //! 但是有 commit 标记，eset 只会在up时触发，结果会导致无法触发修改事件
//   const isChange = checkChnage ? this.get(key) !== val : true
//   if (isChange) {
//     this.set(key, val)
//     this.fire('def:modified', { target: this })
//   }
// }

// Canvas.prototype.getObjectByZIndex = function (idx) {
//   return this.getObjects().find((obj) => obj.getZIndex() === idx) || null
// }

// Canvas.prototype._insertBefore = function (obj, desObj) {
//   const objects = this._objects
//   if (!desObj) {
//     objects.push(obj)
//   } else {
//     const idx = desObj.getZIndex()
//     objects.splice(idx, 0, obj)
//   }
//   obj._set('canvas', this)
//   obj.setCoords()
//   //! 与fabric4 不同，这个字段会保存需要重新渲染的对象列表，需要清空
//   //! by 源码 Canvas._onObjectAdded
//   this._objectsToRender = undefined

//   if (this.renderOnAddRemove) {
//     this.requestRenderAll()
//   }
//   return this
// }

// // 添加，无事件触发版本
// Canvas.prototype._add = function (...objs) {
//   this._objectsToRender = undefined
//   this._objects.push(...objs)
//   objs.forEach((obj) => {
//     obj.canvas = this as Canvas
//     obj.setCoords()
//   })
//   if (this.renderOnAddRemove) {
//     this.requestRenderAll()
//   }
//   return this
// }

// // 删除，无事件触发版本
// Canvas.prototype._remove = function (...objs) {
//   this._objectsToRender = undefined

//   const objects = this._objects
//   let index
//   let somethingRemoved = false

//   for (let i = 0, length = objs.length; i < length; i++) {
//     index = objects.indexOf(objs[i])

//     // only call onObjectRemoved if an object was actually removed
//     if (index !== -1) {
//       somethingRemoved = true
//       objects.splice(index, 1)
//       // this._onObjectRemoved && this._onObjectRemoved(arguments[i])
//     }
//   }

//   if (this.renderOnAddRemove && somethingRemoved) {
//     this.renderAll()
//   }

//   return this
// }

// Canvas.prototype._removeSelected = function () {
//   const active = this.getActiveObject()
//   if (!active) return null

//   if (active instanceof ActiveSelection) {
//     const objs = [...active._objects]
//     this.discardActiveObject()
//     this._remove(...objs)
//     return objs
//   } else {
//     this.discardActiveObject()
//     this._remove(active)
//     return active
//   }
// }
