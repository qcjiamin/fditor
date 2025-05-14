import type { IPlugin } from '../../interface'
import type Editor from '../../Editor'
import './methods'
import { FabricObject } from 'fabric'

export default class SelectionPlugin implements IPlugin {
  #name: string = 'SelectionPlugin'
  public editor!: Editor
  public selectedMap: Map<string, FabricObject>
  constructor() {
    this.selectedMap = new Map()
  }
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)

    this.editor.stage.on('selection:created', () => this.handleSelectEvent())
    this.editor.stage.on('selection:updated', () => this.handleSelectEvent())
    this.editor.stage.on('selection:cleared', () => this.handleSelectEvent())

    // this.editor.on('node:remove', (nodes) => {
    //   console.log(nodes)
    //   const nodesNow = this.tr.nodes()
    //   this.tr.nodes(
    //     nodes.filter((node) => {
    //       return !nodesNow.includes(node)
    //     })
    //   )
    // })
  }

  handleSelectEvent() {
    const activeObj = this.editor.stage.getActiveObject()
    this.editor.emit('selected:change', activeObj)
  }

  /** 清理选中状态 */
  // _clearSelected() {
  //   this.selectedMap.clear()
  // }

  // clearSelected() {
  //   const lastSelected = [...this.selectedMap.values()]
  //   if (lastSelected.length === 0) return
  //   this._clearSelected()
  //   if (!lastSelected) return
  //   this.editor.emit('selected:change', { now: [], before: lastSelected })
  // }

  // addToSelectedMap(nodes: FabricObject[]) {
  //   nodes.forEach((node) => {
  //     this.selectedMap.set(node.id(), node)
  //   })
  // }

  // _select(...nodes: KonvaNode[]) {
  //   if (nodes.length === 0) return
  //   this._clearSelected()
  //   this.addToSelectedMap(nodes)
  //   this.tr.nodes([...this.selectedMap.values()])
  // }
  // select(...nodes: KonvaNode[]) {
  //   if (nodes.length === 0) return
  //   const lastSelected = [...this.selectedMap.values()]
  //   this._select(...nodes)
  //   this.editor.emit('selected:change', { now: [...this.selectedMap.values()], before: lastSelected })
  // }

  // _unSelect(...nodes: KonvaNode[]) {
  //   if (nodes.length === 0) return
  //   nodes.forEach((node) => {
  //     this.selectedMap.delete(node.id())
  //   })
  //   this.tr.nodes([...this.selectedMap.values()])
  // }

  // unSelect(...nodes: KonvaNode[]) {
  //   if (nodes.length === 0) return
  //   const lastSelected = [...this.selectedMap.values()]
  //   this._unSelect(...nodes)
  //   this.editor.emit('selected:change', { now: [...this.selectedMap.values()], before: lastSelected })
  // }
}
