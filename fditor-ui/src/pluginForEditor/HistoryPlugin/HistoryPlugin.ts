// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import type { IPlugin } from '@fditor/core'
import type { IStepInfo } from '@/pluginForEditor/HistoryPlugin/type.ts'
import './methods.ts'

export default class HistoryPlugin implements IPlugin {
  #name: string = 'HistoryPlugin'
  #historyIndex: number = 0
  public editor!: Editor
  private historyList: IStepInfo[]
  // private historyIndex: number
  constructor() {
    this.historyList = []
    // this.historyIndex = 0
  }
  get name() {
    return this.#name
  }
  get historyIndex() {
    return this.#historyIndex
  }
  set historyIndex(val) {
    console.log('historyIndex:', val)
    this.#historyIndex = val
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
    this.editor.on('canvas:ready', () => {
      this.addStep({
        type: 'modify',
        info: JSON.stringify(this.editor.stage.toJSON())
      })
    })

    //todo: 是否需要再这里就监听修改？ 可以，这个插件属于业务插件
    this.editor.on('history:update', (target) => {
      console.log('history:update', target)
      this.addStep({
        type: 'modify',
        info: JSON.stringify(this.editor.stage.toJSON())
      })
      console.log(this.historyList)
    })
  }
  public undo() {
    if (this.historyIndex === 0) return
    this.historyIndex--
    const step = this.historyList[this.historyIndex]
    if (step.type === 'modify') {
      // 先清理选中状态
      this.editor.stage.discardActiveObject()
      this.editor._fromJSON(step.info).then((canvas) => canvas.requestRenderAll())
    }
  }
  public redo() {
    if (this.historyIndex === this.historyList.length - 1) return
    this.historyIndex++
    const step = this.historyList[this.historyIndex]
    if (step.type === 'modify') {
      this.editor.stage.discardActiveObject()
      this.editor._fromJSON(step.info).then((canvas) => canvas.requestRenderAll())
    }
  }
  public addStep(stepInfo: IStepInfo) {
    // 指针不在最后，先移除指针以后的step, 再添加
    if (this.historyIndex !== this.historyList.length - 1) {
      this.historyList.splice(this.historyIndex)
    }
    this.historyList.push(stepInfo)
    this.historyIndex = this.historyList.length - 1
  }
}
