import { ActiveSelection, FabricObject, Group, util } from 'fabric'
import { FCanvas } from '../customShape/FCanvas'

// 扩展 Group 构造函数的类型（静态方法）
declare module 'fabric' {
  // 扩展 Group 实例方法
  interface Group {
    /** 解组，无事件触发。根据组上有无canvas,决定是否插入画布。插入位置为原组Zindex */
    _unGroup: () => void
    toActiveSelection: () => ActiveSelection
    getSubObjsTypes: () => string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapset: (key: string, value: any) => this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapget: (key: string) => any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emapset: (key: string, value: any) => this
  }
  // 扩展 Group 静态方法
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Group {
    let fromObjs: (children: (FabricObject | Group)[]) => Group
  }
}

function isGroup(obj: FabricObject | Group): obj is Group {
  return obj.type === 'group'
}

Group.prototype.getSubObjsTypes = function () {
  const objs = this._objects || []
  const types = objs.map((obj) => obj.type)
  // 去重
  return [...new Set(types)]
}
/* 将属性设置到组下的子对象上 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Group.prototype.mapset = function (key: string, value: any) {
  const types = this.getSubObjsTypes()
  if (types.length > 1) {
    throw new Error('多选不同类型对象时不能设置属性')
  }
  const objs = this._objects || []
  objs.forEach((obj) => {
    obj._set(key, value)
  })
  return this
}

/** 多选或组批量设置属性到子元素，发出自定义修改事件 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Group.prototype.emapset = function (key: string, value: any) {
  this.mapset(key, value)
  if (this.canvas) {
    // 设置定位或宽高之类的属性，需要重新计算范围矩阵
    this.setCoords()
    this.canvas.fire('def:modified', { target: this })
  }
  return this
}

/** 获取组下子元素的指定属性*/
Group.prototype.mapget = function (key: string) {
  // const types = this.getSubObjsTypes()
  // if (types.length > 1) {
  //   throw new Error('多选不同类型对象时不能获取属性')
  // }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vals: any[] = []
  const objs = this._objects || []
  objs.forEach(function (object) {
    vals.push(object.get(key))
  })
  return vals
  //? 作为旧数据的缓存，不去重，如果业务上需要去重，自行处理
  // return [...new Set(vals)]
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
  // canvas._activeObject = selection
  canvas.setActiveObject(selection)
  canvas._objectsToRender = undefined
  selection.setCoords()
  canvas.requestRenderAll()
  // 通知外部执行修改事件和历史记录更新
  this.canvas.fire('def:modified', { target: this })
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
