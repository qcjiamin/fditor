import { InteractiveFabricObject } from 'fabric'
import Editor from '../../Editor'
import BasePlugin from '../BasePlugin'

export default class WorkspacePlugin extends BasePlugin {
  #name: string = 'WorkspacePlugin'
  public editor!: Editor
  constructor() {
    super()
  }
  get name() {
    return this.#name
  }
  init(editor: Editor): void {
    this.editor = editor
    InteractiveFabricObject.ownDefaults = {
      ...InteractiveFabricObject.ownDefaults,
      snapAngle: 45,
      snapThreshold: 5
    }
  }
}
