import { ActiveSelection, FabricObject, Group } from 'fabric'

declare module 'fabric' {
  export interface ActiveSelection {
    toGorup(): Group
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
