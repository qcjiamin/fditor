import { ActiveSelection, Canvas, FabricObject } from 'fabric'
/**
 * 自定义画布对象。挂载一些额外的功能，原则上不添加额外状态，状态由外层控制
 */
export class FCanvas extends Canvas {
  constructor(el?: ConstructorParameters<typeof Canvas>[0], options?: ConstructorParameters<typeof Canvas>[1]) {
    // 设置默认配置，可以被外部设置的配置覆盖
    const _options = {
      // 禁用选中元素置前
      preserveObjectStacking: true,
      // 禁用右键菜单
      stopContextMenu: true,
      ...options
    } as ConstructorParameters<typeof Canvas>[1]
    super(el, _options)
  }
  /**
   * 添加，无事件触发版本
   * @param objs
   * @returns
   */
  _add(...objs: FabricObject[]) {
    this._objectsToRender = undefined
    this._objects.push(...objs)
    objs.forEach((obj) => {
      obj.canvas = this as FCanvas
      obj.setCoords()
    })
    if (this.renderOnAddRemove) {
      this.requestRenderAll()
    }
    return this
  }
  getObjectByZIndex(idx: number) {
    return this.getObjects().find((obj) => obj.getZIndex() === idx) || null
  }
  /** 插入元素，无事件触发 */
  _insertBefore(obj: FabricObject, desObj: FabricObject | null): FCanvas {
    const objects = this._objects
    if (!desObj) {
      objects.push(obj)
    } else {
      const idx = desObj.getZIndex()
      objects.splice(idx, 0, obj)
    }
    obj._set('canvas', this)
    obj.setCoords()
    //! 与fabric4 不同，这个字段会保存需要重新渲染的对象列表，需要清空
    //! by 源码 Canvas._onObjectAdded
    this._objectsToRender = undefined

    if (this.renderOnAddRemove) {
      this.requestRenderAll()
    }
    return this
  }
  /** 删除元素，无事件触发 */
  _remove(...objs: FabricObject[]) {
    this._objectsToRender = undefined

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
      this.renderAll()
    }

    return this
  }
  /** 删除选中元素，无事件触发 */
  _removeSelected() {
    const active = this.getActiveObject()
    if (!active) return null

    if (active instanceof ActiveSelection) {
      const objs = [...active._objects]
      this.discardActiveObject()
      this._remove(...objs)
      return objs
    } else {
      this.discardActiveObject()
      this._remove(active)
      return active
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eset(key: string, val: any, checkChnage?: boolean) {
    //! colorPicker为例，鼠标down和up在同一位置，那么up时设置的颜色值与之前的相同，导致不会触发修改事件
    //! 但是有 commit 标记，eset 只会在up时触发，结果会导致无法触发修改事件
    const isChange = checkChnage ? this.get(key) !== val : true
    if (isChange) {
      this.set(key, val)
      this.fire('def:modified', { target: this })
    }
  }
}
