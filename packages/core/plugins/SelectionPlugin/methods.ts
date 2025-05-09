import Editor from '../../Editor'
import type { KonvaNode } from '../../types'
import SelectionPlugin from './SelectionPlugin'

declare module '@kditor/core' {
  export interface Editor {
    getActiveShapes(): KonvaNode[] | null
    getActiveShape(): KonvaNode
  }
}

Editor.prototype.getActiveShapes = function () {
  const selectionPlugin = this.getPlugin<SelectionPlugin>('SelectionPlugin') as SelectionPlugin
  if (selectionPlugin) {
    const selected: KonvaNode[] = []
    selectionPlugin.tr.nodes().forEach((shape) => {
      selected.push(shape as KonvaNode)
    })
    if (selected.length === 0) {
      return null
    } else {
      return selected as KonvaNode[]
    }
  } else {
    throw new Error('do not have SelectionPlugin')
  }
}

Editor.prototype.getActiveShape = function () {
  const shapes = this.getActiveShapes()
  if (!shapes) throw Error('no activeshapes')
  if (shapes?.length > 1) throw Error('activeshape.length > 1')
  return shapes[0]
}
