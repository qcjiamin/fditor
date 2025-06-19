import { ActiveSelection, Canvas, controlsUtils, FabricObject, Control, util, InteractiveFabricObject } from 'fabric'
import { ControlRenderParams } from '../plugins/LockPlugin/type'
import { predefineControlStyle, predefineOptions } from '../utils/aboutControl'
// 排除 undefined 的 Partial
type ControlNames = keyof ReturnType<typeof controlsUtils.createObjectDefaultControls>
type ControlOptions = Partial<Control>
type defControlOptions = ControlOptions & {
  imgurl?: string
}
type defControlRenderOptions = Omit<defControlOptions, 'imgurl'> & { imgEl?: HTMLImageElement | undefined }
// Partial<Record<ControlNames, ControlOptions>>
type ResetControlParams = Partial<Record<ControlNames, defControlOptions>>
// type Tes = Partial<{ a: { a: string }; b: { a: string } }>
type ResetControlRenderParams = Partial<Record<ControlNames, defControlRenderOptions>>

type Controls = ReturnType<typeof controlsUtils.createObjectDefaultControls> & {
  [key: string]: Control
}

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

  static resetControlStyleAndAction(control: Control, options: defControlRenderOptions) {
    if (options.x) control.x = options.x
    if (options.y) control.y = options.y
    if (options.offsetX) control.offsetX = options.offsetX
    if (options.offsetY) control.offsetY = options.offsetY
    if (options.sizeX) control.sizeX = options.sizeX
    if (options.sizeY) control.sizeY = options.sizeY
    if (options.cursorStyle) control.cursorStyle = options.cursorStyle
    if (options.visible !== undefined) {
      control.visible = options.visible
    }
    if (options.imgEl) {
      const imgEl = options.imgEl
      control.render = function (
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

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = Math.max(xSize, ySize)
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.rotate(util.degreesToRadians(fabricObject.angle))
        document.body.appendChild(imgEl)
        ctx.drawImage(imgEl, -xSize / 2, -ySize / 2, xSize, ySize)
        ctx.restore()
      }
    }
    if (options.mouseUpHandler) {
      control.mouseUpHandler = options.mouseUpHandler
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    FabricObject.createControls = function () {
      const defaultCtls: Controls = controlsUtils.createObjectDefaultControls()
      for (const key in params) {
        // 确保 key 属于 options 的键值
        if (!isKeyInObj(options, key) || !options[key]) continue
        if (!isKeyInObj(defaultCtls, key)) {
          continue
          // 采用 addControl 的方式，不用默认写死的方式
          // defaultCtls[key] = new Control()
        }
        if (!params[key]) continue
        that.resetControlStyleAndAction(defaultCtls[key], params[key])
      }
      return {
        controls: defaultCtls
      }
    }
  }

  static async setPredefineControls() {
    await this.resetControls(predefineOptions)
    // 设置样式
    InteractiveFabricObject.ownDefaults = {
      ...InteractiveFabricObject.ownDefaults,
      ...predefineControlStyle
    }
  }

  static async addControl(name: string, options: defControlOptions) {
    const { controls } = FabricObject.createControls()
    if (isKeyInObj(controls, name)) throw new Error('already exists' + name)
    let params: defControlRenderOptions = {}
    let imgEl: HTMLImageElement | undefined = undefined
    // 加载图片
    if (options.imgurl) {
      imgEl = await util.loadImage(options.imgurl)
    }
    params = {
      ...options,
      imgEl
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    FabricObject.createControls = function () {
      controls[name] = new Control()
      that.resetControlStyleAndAction(controls[name], params)
      return {
        controls
      }
    }
  }
}
