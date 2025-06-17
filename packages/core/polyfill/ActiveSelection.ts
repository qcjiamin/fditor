import { HorizontalAlign, VerticalAlign } from '@fditor/core'
import { ActiveSelection, FabricObject, Group, Point, util } from 'fabric'
import { FCanvas } from '../customShape/FCanvas'

declare module 'fabric' {
  export interface ActiveSelection {
    toGorup(): Group
    setAlign(align: HorizontalAlign | VerticalAlign): void
    /** 解除多选 */
    _unGroup(): void
  }
}

function isGroup(obj: FabricObject | Group): obj is Group {
  return obj.type === 'group'
}

function getMaxZindexInCollection(collection: (FabricObject | Group)[]) {
  if (collection.length === 0) {
    throw new Error('getMaxZindexInCollection collection.length = 0')
  } else if (collection.length === 1) {
    return collection[0].getZIndex()
  }
  const maxZIndexObject = collection.reduce((maxObj, currentObj) => {
    return currentObj.getZIndex() > maxObj.getZIndex() ? currentObj : maxObj
  })
  return maxZIndexObject.getZIndex()
}

ActiveSelection.prototype.toGorup = function () {
  if (!this.canvas) throw new Error('toGroup but no canvas')

  const objs = this._objects
  const tempArr = <(FabricObject | Group)[]>[]

  // 如果参数内有 group, 铺平
  for (let i = 0; i < objs.length; i++) {
    const item = objs[i]
    if (isGroup(item)) {
      const _objs = item._objects
      item._unGroup()
      tempArr.push(..._objs)
      // objs.splice(i, 1, ..._objs)
    } else {
      tempArr.push(item)
    }
  }
  // 铺平array
  // const toObjects = objs.flat(Infinity)
  tempArr.sort((item1, item2) => {
    return item1.getZIndex() - item2.getZIndex()
  })
  tempArr.forEach((item) => {
    console.log(item.canvas)
  })

  const maxZindex = getMaxZindexInCollection(tempArr)
  const beforeObjIdx = maxZindex + 1
  const beforeObj = this.canvas.getObjectByZIndex(beforeObjIdx)
  console.log(beforeObjIdx, beforeObj)

  const newGroup = new Group(tempArr, {
    // canvas: this.canvas
  })
  // !必须先添加再删除，不然zidx不对
  this.canvas._insertBefore(newGroup, beforeObj)
  this.canvas._remove(...tempArr)
  this.canvas._activeObject = newGroup
  return newGroup
}

ActiveSelection.prototype._unGroup = function () {
  if (!this.canvas) return
  const groupMatrix = this.calcOwnMatrix()
  this._objects.forEach(function (object) {
    // instead of using _this = this;
    util.addTransformToObject(object, groupMatrix)
    delete object.group
    object.setCoords()
    object.set('dirty', true)
  })
  this.canvas._activeObject = undefined
  this.canvas.renderAll()
}

ActiveSelection.prototype.setAlign = function (align) {
  if (!this.canvas) return
  const canvas = this.canvas
  if (!(canvas instanceof FCanvas)) return
  let newSelection = null
  const objs = this._objects
  if (align === 'left') {
    const left = this.left
    // canvas._discardActiveObject()
    this._unGroup()
    objs.forEach((obj) => {
      obj.set('left', left)
      obj.setCoords()
    })
  } else if (align === 'right') {
    const right = this.left + this.getScaledWidth()
    this._unGroup()
    objs.forEach((obj) => {
      obj.set('left', right - obj.getScaledWidth())
      obj.setCoords()
    })
  } else if (align === 'center') {
    const center = this.getCenterPoint()
    this._unGroup()
    objs.forEach((obj) => {
      const selfCenter = obj.getCenterPoint()
      obj.setPositionByOrigin(new Point(center.x, selfCenter.y), 'center', 'center')
      obj.setCoords()
    })
  } else if (align === 'top') {
    const top = this.top
    this._unGroup()
    objs.forEach((obj) => {
      obj.set('top', top)
      obj.setCoords()
    })
  } else if (align === 'bottom') {
    const bottom = this.top + this.getScaledHeight()
    this._unGroup()
    objs.forEach((obj) => {
      obj.set('top', bottom - obj.getScaledHeight())
      obj.setCoords()
    })
  } else if (align === 'middle') {
    const center = this.getCenterPoint()
    this._unGroup()
    objs.forEach((obj) => {
      const selfCenter = obj.getCenterPoint()
      obj.setPositionByOrigin(new Point(selfCenter.x, center.y), 'center', 'center')
      obj.setCoords()
    })
  }

  newSelection = new ActiveSelection(objs, { canvas })
  canvas.setActiveObject(newSelection)
  canvas.requestRenderAll()

  this.canvas.fire('def:modified', { target: newSelection! })
}
