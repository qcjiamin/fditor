// todo: 引导线；旋转角度提示；旋转吸附；界面多余部分半透明蒙版
import {
  ActiveSelection,
  Canvas,
  controlsUtils,
  FabricObject,
  Control,
  util,
  InteractiveFabricObject,
  Point,
  TPointerEvent,
  Transform
} from 'fabric'
import { type ControlRenderParams } from '../plugins/LockPlugin/type'
import { predefineControlStyle, predefineOptions } from '../utils/aboutControl'
import { FTextBox } from './FTextBox'
// 排除 undefined 的 Partial
type ControlNames = keyof ReturnType<typeof controlsUtils.createObjectDefaultControls> & string
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

type AngleHitState = {
  isRotating?: boolean
  currentAngle?: number
  cursorPos?: Point
}
interface UniqueFCanvsProps {
  angleHintState: AngleHitState
}

/**
 * 自定义画布对象。挂载一些额外的功能，原则上不添加额外状态，状态由外层控制
 */
export class FCanvas extends Canvas implements UniqueFCanvsProps {
  static otherControls: Record<string, defControlRenderOptions> = {}
  public angleHintState: AngleHitState
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
    this.angleHintState = {}

    //todo 定义旋转角度hint提示，是否可以将其配置化？
    this.boundAngleHit()
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

  private renderRotateLabel(ctx: CanvasRenderingContext2D) {
    const angleText = `${this.angleHintState.currentAngle!.toFixed(0)}°`
    const borderRadius = 5
    const rectWidth = 32
    const rectHeight = 19
    const textWidth = 6.01 * angleText.length - 2.317

    const { tl, br } = this.vptCoords
    /** @type {fabric.Point} */
    const pos = this.angleHintState.cursorPos!.add(new Point(40, 0))

    ctx.save()
    const viewMat = this.viewportTransform
    // 数字处于统一的变换中才能用作计算
    const rectWidthInCvs = rectWidth / viewMat[0]
    const rectHeightInCvs = rectHeight / viewMat[3]
    const offsetX = Math.min(Math.max(pos.x, tl.x), br.x - rectWidthInCvs) * viewMat[0]
    const offsetY = Math.min(Math.max(pos.y, tl.y), br.y - rectHeightInCvs) * viewMat[3]
    // ctx.translate(Math.min(Math.max(pos.x, tl.x), br.x - rectWidth), Math.min(Math.max(pos.y, tl.y), br.y - rectHeight))
    ctx.transform(1, viewMat[1], viewMat[2], 1, viewMat[4] + offsetX, viewMat[5] + offsetY)
    // ctx.translate(Math.min(Math.max(pos.x, tl.x), br.x - rectWidth), Math.min(Math.max(pos.y, tl.y), br.y - rectHeight))
    ctx.beginPath()
    ctx.fillStyle = '#1E1E2E'
    ctx.roundRect(0, 0, rectWidth, rectHeight, borderRadius)
    ctx.fill()
    ctx.font = `400 ${13}px serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(angleText, rectWidth / 2 - textWidth / 2, rectHeight / 2 + 4)
    ctx.restore()
  }

  //todo 监听事件绑定在canvas上，不适合插件化？那么配置化可行？
  boundAngleHit() {
    //todo 使用 originFun 的方式，实现扩展方法，有更清晰的方式吗？
    const originCreateControls = FabricObject.createControls
    FabricObject.createControls = () => {
      const controls = originCreateControls()
      const originMouseUpHandler = controls.controls['mtr'].mouseUpHandler
      controls.controls['mtr'].mouseUpHandler = (
        eventData: TPointerEvent,
        transform: Transform,
        x: number,
        y: number
      ) => {
        if (originMouseUpHandler) originMouseUpHandler(eventData, transform, x, y)
        this.angleHintState.isRotating = false
      }
      return controls
    }
    const originTextCreateControls = FTextBox.createControls
    FTextBox.createControls = () => {
      const controls = originTextCreateControls()
      const originMouseUpHandler = controls.controls['mtr'].mouseUpHandler
      controls.controls['mtr'].mouseUpHandler = (
        eventData: TPointerEvent,
        transform: Transform,
        x: number,
        y: number
      ) => {
        if (originMouseUpHandler) originMouseUpHandler(eventData, transform, x, y)
        this.angleHintState.isRotating = false
      }
      return controls
    }

    this.on('object:rotating', (e) => {
      const obj = e.target
      if (!obj) return
      this.angleHintState.isRotating = true
      this.angleHintState.currentAngle = obj.angle
      this.angleHintState.cursorPos = e.pointer
    })
    this.on('after:render', (opt) => {
      // 处于旋转时，绘制
      if (!this.angleHintState.isRotating) return
      this.renderRotateLabel(opt.ctx)
    })
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
        ctx.drawImage(imgEl, -xSize / 2, -ySize / 2, xSize, ySize)
        ctx.restore()
      }
    }
    if (options.mouseUpHandler) {
      control.mouseUpHandler = options.mouseUpHandler
    }
  }

  /**
   * 重写原生的 CreateControls 方法。默认的控制点可以设置图片替换；
   * addControl 新增的控制点需要先加载好图片，这里可以自动创建出 Control 对象；
   * 如果有对象需要独占控制点，在其自身的构建方法中添加
   * @param options
   * @returns
   */
  static async resetCreateControls(options: ResetControlParams) {
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
    function reset(defaultCtls: Controls) {
      //! 重置默认控制点样式和事件
      for (const key in params) {
        // 确保 key 属于 options 的键值
        if (!isKeyInObj(options, key) || !options[key]) continue
        if (!isKeyInObj(defaultCtls, key)) {
          continue
          // 采用 addControl 的方式，不用默认写死的方式
          // defaultCtls[key] = new Control()
        }
        if (!params[key]) continue
        FCanvas.resetControlStyleAndAction(defaultCtls[key], params[key])
      }
      //! 创建其他控制点样式并设置事件
      Object.keys(FCanvas.otherControls).forEach((key) => {
        defaultCtls[key] = new Control()
        FCanvas.resetControlStyleAndAction(defaultCtls[key], FCanvas.otherControls[key])
      })
      return {
        controls: defaultCtls
      }
    }

    FabricObject.createControls = function () {
      const defaultCtls: Controls = controlsUtils.createObjectDefaultControls()
      return reset(defaultCtls)
    }
    // textBox 需要单独处理
    FTextBox.createControls = function () {
      const defaultCtls: Controls = controlsUtils.createTextboxDefaultControls()
      return reset(defaultCtls)
    }
  }

  static async setPredefineControls() {
    await this.resetCreateControls(predefineOptions)
    // 设置样式
    InteractiveFabricObject.ownDefaults = {
      ...InteractiveFabricObject.ownDefaults,
      ...predefineControlStyle
    }
  }

  static async addControl(name: string, options: defControlOptions) {
    const { controls } = FabricObject.createControls()
    if (isKeyInObj(controls, name) || isKeyInObj(this.otherControls, name)) throw new Error('already exists' + name)
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

    this.otherControls[name] = params
  }
}
