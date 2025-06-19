//todo: 一些基础方法没有拆分_fun 与 fun, 在需要时可以添加
import { EventBus } from './utils/event'
import type { EditorEventMap, IPlugin } from './types'
import { Layout, layoutDimensions } from './types'
import { v4 as uuidv4 } from 'uuid'
// import { BG_COLOR } from './utils/constant'
import './polyfill'
import { Canvas } from 'fabric'
import { util } from 'fabric'
import { FCanvas } from './customShape/FCanvas'
import { FImage } from '@fditor/core'
import { ClipFrame } from './customShape/ClipFrame'
import BasePlugin from './plugins/BasePlugin'
interface IRect {
  x: number
  y: number
  width: number
  height: number
}

type PluginConstructor<T extends BasePlugin = BasePlugin> = new (...args: any[]) => T

declare module 'fabric' {
  interface FabricObject {
    id: string
  }
}

// & Record<string, unknown[]> 当需要自定义事件时，可以使用联合类型
// 当前不使用是因为想要事件名的提示
class Editor extends EventBus<EditorEventMap> {
  #stage: FCanvas | null = null
  #pluginMap: Map<string, IPlugin>
  #layout: Layout
  public resizeObserver: ResizeObserver | null = null
  public workspace!: IRect
  public scaleRate: number
  public container: HTMLDivElement | null = null
  public isSilence: boolean = false
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
    this.autoSize(this.container!.clientWidth, this.container!.clientHeight)
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

  public init(element: HTMLCanvasElement) {
    this.#stage = new FCanvas(element, {
      // 控制点绘制在overlay image 和 clippath 之上
      controlsAboveOverlay: true
    })

    //todo: 多场景的话，切换场景时动态绑定监听事件
    // 将添加、删除、移动、缩放、旋转，统一触发自定义的修改事件
    this.stage.on('def:modified', ({ target }) => {
      if (this.isSilence) {
        console.log('%cdef:modified but silence', 'color: rgba(255, 0, 0); font-weight: bold')
        return
      }
      this.stage.requestRenderAll()
      this.emit('node:modified', { target })
      this.emit('history:update', undefined)
    })
    // 对象移动，缩放，文字编辑完成
    this.stage.on('object:modified', (options) => {
      if (this.isSilence) {
        console.log('%cobject:modified but silence', 'color: rgba(255, 0, 0); font-weight: bold')
        return
      }
      this.emit('node:modified', { target: options.target })
      this.emit('history:update', undefined)
    })
    this.stage.on('object:added', () => {
      if (this.isSilence) {
        console.log('%cobject:added but silence', 'color: rgba(255, 0, 0); font-weight: bold')
        return
      }
      this.emit('history:update', undefined)
    })
    this.stage.on('confirm:clip', async (clipFrame: ClipFrame) => {
      await this.confirmClip(clipFrame)
      this.emit('confirm:clip', undefined)
    })

    // 删除使用自定义的事件
    this.on('node:remove', () => {
      //! 不同于属性修改，删除只需要更新history, 属性条修改会被 selection:clear 处理
      // this.emit('node:modified', { target })
      this.emit('history:update', undefined)
    })

    window.fab = this.stage
    this.#stage.backgroundColor = 'rgba(255,255,255,1)'
    // todo: 这里强制监听了画布容器元素的父元素。不是很严谨，会疑惑为什么是父元素
    // 因为容器元素为相对定位，用父元素来自适应窗口调整，不让容器把窗口撑起来导致observer 无效
    //! 必须优化
    this.container = element.parentElement!.parentElement!.parentElement as HTMLDivElement
    this.resizeObserver = new ResizeObserver(this.onContainerResize)
    this.resizeObserver.observe(this.container)
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

  public async initControlInfo() {
    // 加载图片？
  }

  public getPlugin<T extends IPlugin>(pluginName: string): T | undefined {
    return this.pluginMap.get(pluginName) as T
  }

  public getActiveObject() {
    return this.stage.getActiveObject()
  }
  /** 提供给修改对象的属性使用，所以必须有一个选中对象 */
  public getSelectedObject() {
    const obj = this.getActiveObject()
    if (!obj) throw new Error('getSelectedObject but there is no object that is selected')
    return obj
  }

  public _add(...nodes: FabricObject[]): this {
    this.stage.add(
      ...nodes.map((node) => {
        if (!node.id) {
          node.id = uuidv4()
        }
        return node
      })
    )
    return this
  }

  /** 业务逻辑方法，添加并选中元素 */
  public add(obj: FabricObject) {
    // 添加
    this.stage.add(obj)
    // 选中
    this.stage.setActiveObject(obj)
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
    this.emit('history:update', undefined)
  }
  /** 取消裁剪 */
  public async cancelClip() {
    const selected = this.stage.getActiveObject()
    if (!selected) return
    if (!(selected instanceof ClipFrame)) return
    await selected.belong.cancelClip()
  }
  /**------ 裁剪方法 end ----- */

  public toJSON() {}

  // interface LayerConfig {
  //   children: Konva.Node[];
  // }
  /** 无事件版本加载配置渲染 */
  public async _fromJSON(json: string) {
    const cvs = await this.withSilence<Canvas>(() => this.stage.loadFromJSON(json))
    // const cvs = await this.stage.loadFromJSON(json)
    cvs.renderAll()
    return cvs
  }
  public fromJSON(json: string) {
    console.log(json)
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
    console.log('autosize')
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
  }

  public onContainerResize = (e: ResizeObserverEntry[]): void => {
    console.log('resize')
    const { width, height } = e[0].contentRect

    this.autoSize(width, height)
  }

  // public update(nodes: KonvaNode[]): void {
  //   this.emit('node:update:before', { nodes })
  //   // nodes.forEach((node) => {
  //   //   node.setAttrs({ ...node.attrs })
  //   // })
  //   // !需要清理缓存后，才能重绘
  //   nodes.forEach((node) => {
  //     node._needClearTransformCache = true
  //     // node.clearCache()
  //     node._clearCache()
  //     node.fire('absoluteTransformChange')
  //     // node._clearSelfAndDescendantCache('absoluteTransform')
  //   })
  //   this.render()
  //   this.emit('node:update:after', { nodes })
  // }
}

export default Editor
