import { FabricObject, Group, util } from 'fabric'

// 扩展 Group 构造函数的类型（静态方法）
declare module 'fabric' {
  interface Group {
    _unGroup: () => void
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Group {
    let fromObjs: (children: (FabricObject | Group)[]) => Group
  }
}

function isGroup(obj: FabricObject | Group): obj is Group {
  return obj.type === 'group'
}

/** 解组，无事件触发 */
Group.prototype._unGroup = function () {
  // 解组
  const nextObj = this.getNext()
  const canvas = this.canvas
  const groupMatrix = this.calcOwnMatrix()
  this._objects.forEach(function (object) {
    // instead of using _this = this;
    util.addTransformToObject(object, groupMatrix)

    delete object.group
    if (canvas) {
      canvas.insertBefore(object, nextObj)
      object.setCoords()
    }
  })
  if (canvas) {
    canvas?._remove(this)
  }
  return this
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
