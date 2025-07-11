import { InteractiveFabricObject } from 'fabric'
import Editor from '../../Editor'
import BasePlugin from '../BasePlugin'

export default class SnapPlugin extends BasePlugin {
  #name: string = 'SnapPlugin'
  public editor!: Editor
  constructor() {
    super()
  }
  get name() {
    return this.#name
  }
  //todo 按shift时才步进吸附？
  init(editor: Editor): void {
    this.editor = editor
    InteractiveFabricObject.ownDefaults = {
      ...InteractiveFabricObject.ownDefaults,
      snapAngle: 45,
      snapThreshold: 5
    }
    this.editor.emit('plugin:installed', this)
  }
}
