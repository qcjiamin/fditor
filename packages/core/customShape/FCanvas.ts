import { ActiveSelection, Canvas, controlsUtils, FabricObject, Control, util } from 'fabric'
import { ControlRenderParams } from '../plugins/LockPlugin/type'
// 排除 undefined 的 Partial
type ControlNames = keyof ReturnType<typeof controlsUtils.createObjectDefaultControls> | 'lock'
type ControlOptions = Partial<Control>
type defControlOptions = Pick<ControlOptions, 'x' | 'y' | 'offsetX' | 'offsetY' | 'sizeX' | 'sizeY'> & {
  imgurl: string
}
type defControlRenderOptions = Omit<defControlOptions, 'imgurl'> & { imgEl: HTMLImageElement | undefined }
// Partial<Record<ControlNames, ControlOptions>>
type ResetControlParams = Partial<Record<ControlNames, defControlOptions>>
type ResetControlRenderParams = Partial<Record<ControlNames, defControlRenderOptions>>

//! 这样可以明确是否为对象属性，obj[k]时可以推断出该属性的类型
function isKeyInObj<T extends object>(obj: T, k: PropertyKey): k is keyof T {
  return k in obj
}

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

  static async resetControls(options: ResetControlParams) {
    if (Object.keys(options).length === 0) return

    // 加载完图片
    const params: ResetControlRenderParams = {}
    for (const key in options) {
      let imgEl = undefined
      if (!isKeyInObj(options, key)) continue
      if (options[key] && options[key].imgurl) {
        imgEl = await util.loadImage(options[key].imgurl)
      }
      params[key] = {
        ...options[key],
        imgEl
      }
    }

    FabricObject.createControls = function () {
      const defaultCtls = controlsUtils.createObjectDefaultControls()
      for (const key in params) {
        if (!isKeyInObj(defaultCtls, key)) continue
        if (!params[key]) continue
        if (params[key].x) defaultCtls[key].x = params[key].x
        if (params[key].y) defaultCtls[key].y = params[key].y
        if (params[key].offsetX) defaultCtls[key].offsetX = params[key].offsetX
        if (params[key].offsetY) defaultCtls[key].offsetY = params[key].offsetY
        if (params[key].sizeX) defaultCtls[key].sizeX = params[key].sizeX
        if (params[key].sizeY) defaultCtls[key].sizeY = params[key].sizeY
        if (params[key].imgEl) {
          const imgEl = params[key].imgEl
          defaultCtls[key].render = function (
            ctx: ControlRenderParams[0],
            left: ControlRenderParams[1],
            top: ControlRenderParams[2],
            styleOverride: ControlRenderParams[3],
            fabricObject: ControlRenderParams[4]
          ) {
            const xSize = this.sizeX || styleOverride?.cornerSize || fabricObject.cornerSize
            const ySize = this.sizeY || styleOverride?.cornerSize || fabricObject.cornerSize
            ctx.save()
            ctx.translate(left, top)
            ctx.rotate(util.degreesToRadians(fabricObject.angle))
            ctx.drawImage(imgEl, -xSize / 2, -ySize / 2, xSize, ySize)
            ctx.restore()
          }
        }
      }
      return {
        controls: defaultCtls
      }
    }
  }

  static resetDefaultControl() {
    const defaultCtls = controlsUtils.createObjectDefaultControls()

    defaultCtls.bl.render = function () {}
    new Control()
  }
}
