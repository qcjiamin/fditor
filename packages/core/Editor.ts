//todo: 一些基础方法没有拆分_fun 与 fun, 在需要时可以添加
import { EventBus } from './utils/event'
import type { EditorEventMap, IPlugin } from './types'
import { Layout, layoutDimensions } from './types'
import { v4 as uuidv4 } from 'uuid'
// import { BG_COLOR } from './utils/constant'
import './polyfill'
import { Canvas, FabricObject } from 'fabric'
import { util } from 'fabric'
interface IRect {
  x: number
  y: number
  width: number
  height: number
}

declare module 'fabric' {
  interface FabricObject {
    id: string
  }
}

// & Record<string, unknown[]> 当需要自定义事件时，可以使用联合类型
// 当前不使用是因为想要事件名的提示
class Editor extends EventBus<EditorEventMap> {
  #stage: Canvas | null = null
  #pluginMap: Map<string, IPlugin>
  #layout: Layout
  public resizeObserver: ResizeObserver | null = null
  public workspace!: IRect
  public scaleRate: number
  public container: HTMLDivElement | null = null
  constructor(layout: Layout = Layout.Portrait) {
    super()
    this.#layout = layout
    this.scaleRate = 1
    this.workspace = { x: 0, y: 0, width: 100, height: 100 }
    this.#pluginMap = new Map()
  }
  get stage() {
    return <Canvas>this.#stage
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

  public init(element: HTMLCanvasElement) {
    this.#stage = new Canvas(element, {
      // 控制点绘制在overlay image 和 clippath 之上
      controlsAboveOverlay: true
    })

    this.stage.on('def:modified', (node) => {
      this.emit('node:modified', node)
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

  public use(plugin: { new (): IPlugin }) {
    const plugnInstance = new plugin()
    if (!this.pluginMap.has(plugnInstance.name)) {
      plugnInstance.init(this)
      this.pluginMap.set(plugnInstance.name, plugnInstance)
    } else {
      console.error(`${plugnInstance.name} has installed`)
    }
    return this
  }
  // todo: 插件的禁用，启用和卸载

  public getPlugin<T extends IPlugin>(pluginName: string): T | undefined {
    return this.pluginMap.get(pluginName) as T
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
  public add(...nodes: FabricObject[]): this {
    this._add(...nodes)
    this.emit('node:add', nodes)
    return this
  }

  public _remove(...nodes: FabricObject[]): this {
    this.stage.remove(...nodes)
    return this
  }
  public remove(...nodes: FabricObject[]) {
    this._remove(...nodes)
    this.emit('node:remove', nodes)
    return this
  }

  // public _moveUp(...nodes: KonvaNode[]): this {
  //   nodes.forEach((node) => {
  //     node.moveUp()
  //   })
  //   return this
  // }
  // public moveUp(...nodes: KonvaNode[]): this {
  //   this._moveUp(...nodes)
  //   //todo: 事件仅通知哪些元素 zindex 发生了变化，需要时可修改参数为变化前后数据
  //   this.emit('node:zindex:change', nodes)
  //   return this
  // }
  // public _moveDown(...nodes: KonvaNode[]): this {
  //   nodes.forEach((node) => {
  //     node.moveDown()
  //   })
  //   return this
  // }
  // public moveDown(...nodes: KonvaNode[]): this {
  //   this._moveDown(...nodes)
  //   this.emit('node:zindex:change', nodes)
  //   return this
  // }
  // public moveTop(...nodes: KonvaNode[]): this {
  //   nodes.forEach((node) => {
  //     node.moveToTop()
  //   })
  //   this.emit('node:zindex:change', nodes)
  //   return this
  // }
  // public moveBottom(...nodes: KonvaNode[]): this {
  //   nodes.forEach((node) => {
  //     node.moveToBottom()
  //   })
  //   this.emit('node:zindex:change', nodes)
  //   return this
  // }

  public toJSON() {}

  // interface LayerConfig {
  //   children: Konva.Node[];
  // }

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
