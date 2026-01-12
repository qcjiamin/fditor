//todo: 一些基础方法没有拆分_fun 与 fun, 在需要时可以添加
import { EventBus } from './utils/event'
import type { EditorEventMap, IPlugin, IRect } from './types/common/types'
import { Layout, layoutDimensions } from './types/common/types'
// import { BG_COLOR } from './utils/constant'
import './polyfill'
import { Canvas, classRegistry, FabricObject } from 'fabric'
import { util } from 'fabric'
import { FCanvas } from './customShape/FCanvas'
import { FImage, FTextBox, isActiveSelection } from '@fditor/core'
import { ClipFrame } from './customShape/ClipFrame'
import BasePlugin from './plugins/BasePlugin'
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, objectCommonProperties } from './utils/constant'
import { isFirefox } from './utils/common'
import { isFPenPath } from './utils/tsHelper'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PluginConstructor<T extends BasePlugin = BasePlugin> = new (...args: any[]) => T

// & Record<string, unknown[]> 当需要自定义事件时，可以使用联合类型
// 当前不使用是因为想要事件名的提示
class Editor extends EventBus<EditorEventMap> {
  #stage: FCanvas | null = null
  #pluginMap: Map<string, IPlugin>
  #layout: Layout
  public workspace!: IRect
  public scaleRate: number
  public isSilence: boolean = false
  /** 复制的字符串，给不支持 clipboard api 的浏览器使用 */
  public copyStr: string = ''
  constructor(layout: Layout = Layout.Portrait) {
    super()
    this.#layout = layout
    this.scaleRate = 1
    this.workspace = { x: 0, y: 0, width: 100, height: 100 }
    this.#pluginMap = new Map()
    this.isSilence = false
  }
  get stage() {
    return <FCanvas>this.#stage
  }
  get pluginMap() {
    return <Map<string, IPlugin>>this.#pluginMap
  }
  get layout() {
    return this.#layout
  }
  set layout(value: Layout) {
    this.#layout = value
    // this.autoSize(this.container!.clientWidth, this.container!.clientHeight)
    this.emit('layout:change', null)
  }

  /** 全局静默包装器 */
  public async withSilence<T>(dosomething: () => T | Promise<T>): Promise<T> {
    this.isSilence = true
    try {
      return await Promise.resolve(dosomething())
    } finally {
      this.isSilence = false
    }
  }

  #canvasContainer: Element | null = null

  public async init(container: HTMLElement | string) {
    // 1. 解析容器
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container
    if (!containerEl) {
      throw new Error('Container element not found')
    }
    this.#canvasContainer = containerEl

    // 2. 清理旧的 canvas（支持重新初始化）
    if (this.#canvasContainer) {
      this.#canvasContainer.innerHTML = ''
    }

    // 3. 创建新的 canvas
    const canvasElement = document.createElement('canvas')
    canvasElement.style.width = '100%'
    canvasElement.style.height = '100%'
    containerEl.appendChild(canvasElement)

    // 4. 扩展序列化属性
    // 确保 id 属性被序列化
    // Fabric.js 需要在 customProperties 中声明自定义属性才会被 toJSON 序列化
    FabricObject.customProperties = [...(FabricObject.customProperties || []), ...objectCommonProperties]

    // 5. 重置控制点
    await FCanvas.setPredefineControls()
    this.#stage = new FCanvas(canvasElement, {
      // 控制点绘制在overlay image 和 clippath 之上
      controlsAboveOverlay: true,
      showGuideLine: true
    })
    // 6. 绑定事件
    // 事件分为 对fabric内部的事件代理 和业务事件
    //todo: 多场景的话，切换场景时动态绑定监听事件; 事件的绑定统一到方法中
    // 将添加、删除、旋转，统一触发自定义的修改事件
    this.stage.on('def:modified', ({ target }) => {
      if (this.isSilence) {
        console.log('%cdef:modified but silence', 'color: rgba(255, 0, 0); font-weight: bold')
        return
      }
      this.stage.requestRenderAll()
      this.emit('node:modified', { target })
    })
    // 对象移动，缩放，文字编辑完成
    this.stage.on('object:modified', (options) => {
      if (this.isSilence) {
        console.log('%cobject:modified but silence', 'color: rgba(255, 0, 0); font-weight: bold')
        return
      }
      this.emit('node:modified', { target: options.target })
    })
    this.stage.on('object:added', () => {
      if (this.isSilence) {
        console.log('%cobject:added but silence', 'color: rgba(255, 0, 0); font-weight: bold')
        return
      }
    })
    this.stage.on('confirm:clip', async (clipFrame: ClipFrame) => {
      await this.confirmClip(clipFrame)
      this.emit('confirm:clip', undefined)
    })
    this.stage.on('subPenType:change', ({ newType }) => {
      this.emit('subPenType:change', { newType })
    })
    this.stage.on('mouse:dblclick', async (options) => {
      if (!options.target) {
        this.leavePenMode()
      } else if (isFPenPath(options.target)) {
        // 先通知进入钢笔状态，再通知进入钢笔-选择状态
        this.emit('enter:penMode', undefined)
        options.target.enterSelectMode()
      }
    })

    this.on('node:add', (target) => {
      this.emit('node:modified', { target })
    })
    // 删除使用自定义的事件
    this.on('node:remove', () => {
      //! 不同于属性修改，删除只需要更新history, 属性条修改会被 selection:clear 处理
      // this.emit('node:modified', { target })
    })

    // 自由会话时的鼠标样式继承父级元素的样式
    this.stage.freeDrawingCursor = 'inherit'
    // window.fab = this.stage
    this.#stage.backgroundColor = 'rgba(255,255,255,1)'
  }

  public dispose() {
    // 1. 清理 stage
    if (this.#stage) {
      this.#stage.dispose()
      this.#stage = null
    }

    // 2. 移除 canvas 元素
    if (this.#canvasContainer) {
      this.#canvasContainer.innerHTML = ''
    }

    // 3. 清理事件监听
    this.removeAllListeners() // 清理所有事件监听器
  }

  public async use(plugin: PluginConstructor) {
    const plugnInstance = new plugin()
    if (!this.pluginMap.has(plugnInstance.name)) {
      await plugnInstance.init(this)
      this.pluginMap.set(plugnInstance.name, plugnInstance)
    } else {
      console.error(`${plugnInstance.name} has installed`)
    }
    return this
  }
  // todo: 插件的禁用，启用和卸载

  public async useAll(...plugins: PluginConstructor[]) {
    await Promise.all(
      plugins.map((plugin) => {
        return this.use(plugin)
      })
    )
  }

  public getPlugin<T extends IPlugin>(pluginName: string): T | undefined {
    return this.pluginMap.get(pluginName) as T
  }

  public getActiveObject() {
    return this.stage.getActiveObject()
  }

  public getObjectById(id: string): FabricObject | undefined {
    const objs = this.stage.getObjects().filter((obj) => {
      return obj.id === id
    })
    if (objs.length > 1) throw new Error('getObjectById get more then 1 objects')
    return objs[0]
  }

  public _add(...nodes: FabricObject[]): this {
    this.stage._add(...nodes)
    return this
  }

  /** 业务逻辑方法，添加并选中元素 */
  public add(obj: FabricObject) {
    // 添加
    // this.stage.add(obj)
    // 选中
    // this.stage.setActiveObject(obj)
    this._add(obj)
    // this.stage._activeObject = obj
    this.stage.setActiveObject(obj)
    // 触发修改事件和历史记录更新
    this.emit('node:add', [obj])
    return this
  }

  /** 删除选中的对象 */
  public remove() {
    const removed = this.stage._removeSelected()
    if (removed) {
      this.emit('node:remove', removed)
    }
  }

  /**------ 裁剪方法 start ----- */
  // 裁剪理解为业务方法，由于裁剪框会频繁触发修改事件，不大适合放入画布对象中
  /** 开始裁剪 */
  public async doClip() {
    const selected = this.stage.getActiveObject()
    if (!selected) return
    if (!(selected instanceof FImage)) return
    await this.withSilence(() => selected.doClip())
  }
  /** 确认裁剪 */
  public async confirmClip(clipFrame?: ClipFrame) {
    const selected = clipFrame ? clipFrame : this.stage.getActiveObject()
    if (!selected) return
    if (!(selected instanceof ClipFrame)) return
    await selected.belong.confirmClip()
    this.emit('node:modified', { target: this.stage })
  }
  /** 取消裁剪 */
  public async cancelClip() {
    const selected = this.stage.getActiveObject()
    if (!selected) return
    if (!(selected instanceof ClipFrame)) return
    await selected.belong.cancelClip()
  }
  /**------ 裁剪方法 end ----- */

  public toJSON() {
    return JSON.stringify(this.stage.toJSON() as object)
  }

  // interface LayerConfig {
  //   children: Konva.Node[];
  // }
  /** 无事件版本加载配置渲染 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async _fromJSON(json: string | Record<string, any>) {
    const cvs = await this.withSilence<Canvas>(() => this.stage.loadFromJSON(json))
    // const cvs = await this.stage.loadFromJSON(json)
    cvs.renderAll()
    return cvs
  }
  public fromJSON(json: string) {
    this._fromJSON(json)
  }

  public async getPreviewThum() {
    const blob = await this.stage.toBlob({
      quality: 1,
      multiplier: 0.4
    })
    if (!blob) throw new Error('getPreviewThum null')
    return blob
  }

  public render(): void {
    const activeObj = this.stage.getActiveObject()
    if (activeObj) {
      console.log('set coords')
      activeObj.setCoords()
    }
    this.stage.renderAll()
  }

  /** 将视口移动到指定区域的中心点 */
  public moveViewportToWorkspaceCenter(range: IRect) {
    // this.stage.width() / 2         视口的中心点，stage的范围就是视口
    // rangeCenterPoint.x * scaleTo   workspace 中心点在视口内当前的宽高
    // 将中心点对齐
    const rangeCenterPoint = { x: range.width / 2, y: range.height / 2 }
    const stagePosition = {
      x: this.stage.width / 2 - rangeCenterPoint.x * this.scaleRate,
      y: this.stage.height / 2 - rangeCenterPoint.y * this.scaleRate
    }
    // 让目标区域中心点对齐到视口中心
    const curViewTtransform = this.stage.viewportTransform
    curViewTtransform[4] = stagePosition.x
    curViewTtransform[5] = stagePosition.y
    this.stage.setViewportTransform(curViewTtransform)
  }

  /** 画布内工作区自适应 */
  public autoSize(width: number, height: number) {
    this.stage.setDimensions({
      width: width,
      height: height
    })
    // 主动绘制一遍，避免闪烁
    this.stage.renderAll()
    const stageWidth = this.stage.width
    const stageHeight = this.stage.height
    const toDimensions = layoutDimensions[this.layout]
    const scaleTo = util.findScaleToFit(toDimensions, { width: stageWidth, height: stageHeight })
    //todo: 这里采用改变缩放率的方式，可以固定缩放率切换layout
    this.scaleRate = scaleTo
    this.stage.setZoom(scaleTo)
    // 画布宽高
    const innerW = stageWidth / scaleTo
    const innerH = stageHeight / scaleTo
    this.workspace = {
      x: (innerW - toDimensions.width) / 2,
      y: (innerH - toDimensions.height) / 2,
      width: toDimensions.width,
      height: toDimensions.height
    }
    this.emit('workspace:resize', null)
    // 触发fabric.canvas 的 resize 事件，因为实际改变了宽高；目前已知会监听的功能：guideline
    this.stage.fire('canvas:resize')
  }

  /** 剪切板是否有可控的复制内容 */
  public async hasCopyStr() {
    let copyStr = ''
    if (isFirefox()) {
      copyStr = this.copyStr
    } else {
      try {
        copyStr = await navigator.clipboard.readText()
      } catch (error) {
        console.log(error)
      }
    }
    return Boolean(copyStr)
  }

  public async copy(obj: FabricObject) {
    console.log('copy')
    const temp = obj.toJSON()
    if (isFirefox()) {
      this.copyStr = JSON.stringify(temp)
    } else {
      await navigator.clipboard.writeText(JSON.stringify(temp))
    }
  }

  public async paste() {
    // 当前焦点如果在输入框内的话，不处理
    if (document.activeElement && document.activeElement.tagName !== 'BODY') return false
    let copyStr = ''
    if (isFirefox()) {
      copyStr = this.copyStr
    } else {
      copyStr = await navigator.clipboard.readText()
    }
    if (!copyStr) return false
    let pasteObj: string | { type: string } = ''
    try {
      pasteObj = JSON.parse(copyStr) as { type: string }
    } catch {
      // 创建文字对象，然后添加到画布
      const text = new FTextBox(copyStr, {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE
      })
      this.add(text as FabricObject)
      return true
    }

    // 先取消当前的选中
    this.stage.discardActiveObject()

    //todo ts的类型检查不严谨, 根源在于 fabric.js 的类型定义比较复杂，后期优化
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = (await (classRegistry.getClass(pasteObj.type) as any).fromObject(pasteObj)) as FabricObject

    // 如果是多选，需要做额外处理
    if (isActiveSelection(instance)) {
      const activeSelectionObj = instance
      // 将克隆的画布重新赋值
      activeSelectionObj.canvas = this.stage
      activeSelectionObj.forEachObject((obj) => {
        this.stage._add(obj)
      })
      activeSelectionObj.setCoords()
      this.stage.setActiveObject(activeSelectionObj)
      this.render()
      // 触发修改
      this.emit('node:add', [])
    } else {
      this.add(instance as FabricObject)
    }
    return true
  }
}

export default Editor
