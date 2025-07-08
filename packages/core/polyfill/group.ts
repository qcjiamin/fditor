import { ActiveSelection, FabricObject, Group, util } from 'fabric'
import { FCanvas } from '../customShape/FCanvas'

// 扩展 Group 构造函数的类型（静态方法）
declare module 'fabric' {
  interface Group {
    /** 解组，无事件触发。根据组上有无canvas,决定是否插入画布。插入位置为原组Zindex */
    _unGroup: () => void
    toActiveSelection: () => ActiveSelection
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Group {
    let fromObjs: (children: (FabricObject | Group)[]) => Group
  }
}

function isGroup(obj: FabricObject | Group): obj is Group {
  return obj.type === 'group'
}

Group.prototype._unGroup = function () {
  if (!this.canvas) throw new Error('')
  // 解组
  const nextObj = this.getNext()
  const canvas = this.canvas as FCanvas
  const groupMatrix = this.calcOwnMatrix()
  canvas._activeObject = undefined
  this._objects.forEach(function (object) {
    object.parent = undefined
    // instead of using _this = this;
    util.addTransformToObject(object, groupMatrix)

    delete object.group
    if (canvas) {
      canvas._insertBefore(object, nextObj)
      object.setCoords()
    }
  })
  if (canvas) {
    canvas?._remove(this)
  }
}

/** 组转换为多选 */
Group.prototype.toActiveSelection = function () {
  if (!this.canvas) {
    throw new Error('toAvtiveSelection but no canvas')
  }
  // const objects = this._objects
  // const canvas = this.canvas
  // // 获取当前组的zindex, 向后找对象，往前插入
  // const nextObj = this.getNext()
  // this._objects = []
  // const options = this.toObject()
  // // options.objects = []
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // delete (options as any).objects
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // delete (options as any).type

  // console.log(options)
  // const activeSelection = new ActiveSelection([])
  // activeSelection.set(options)

  // canvas._remove(this)

  // objects.forEach(function (object) {
  //   object.group = activeSelection
  //   object.dirty = true
  //   canvas.insertBefore(object, nextObj)
  // })
  // activeSelection.canvas = canvas
  // activeSelection._objects = objects
  // activeSelection.setCoords()
  // canvas._activeObject = activeSelection
  // canvas._objectsToRender = undefined
  // return activeSelection

  const canvas = this.canvas
  const objs = this._objects
  this._unGroup()
  canvas._remove(this)
  const selection = new ActiveSelection(objs, { canvas })
  canvas._activeObject = selection
  // canvas.setActiveObject(selection)
  canvas._objectsToRender = undefined
  selection.setCoords()
  canvas.requestRenderAll()
  return selection
}

Group.fromObjs = function (children) {
  if (!children) throw new Error('group.fromObjs but no children')

  for (let i = 0; i < children.length; i++) {
    const item = children[i]
    if (isGroup(item)) {
      const _objs = item._objects as FabricObject[]
      item._unGroup()
      children.splice(i, 1, ..._objs)
    }
  }

  // const newGroup = new Group(children)
  // // this.insertBeforeAndEmit(newGroup, beforeObj)
  // this?.canvas._remove(...toObjects)
  // this._activeObject = newGroup

  return new Group(children)
}
