// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import type { IPlugin } from '@fditor/core'
import type { IStepInfo } from '@/pluginForEditor/HistoryPlugin/type.ts'
import './methods.ts'
import { ActiveSelection } from 'fabric'

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
    this.editor.emit('historyIndex:update', undefined)
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
      this.editor._fromJSON(step.info).then((canvas) => {
        // 恢复选中状态
        this.restoreSelection(step)
        canvas.requestRenderAll()
      })
    }
  }
  public redo() {
    if (this.historyIndex === this.historyList.length - 1) return
    this.historyIndex++
    const step = this.historyList[this.historyIndex]
    if (step.type === 'modify') {
      this.editor.stage.discardActiveObject()
      this.editor._fromJSON(step.info).then((canvas) => {
        // 恢复选中状态
        this.restoreSelection(step)
        canvas.requestRenderAll()
      })
    }
  }
  public addStep(stepInfo: IStepInfo) {
    // 保存当前选中对象的 ID
    const activeObject = this.editor.stage.getActiveObject()
    console.log('addStep activeObject:', activeObject)
    if (activeObject) {
      if (activeObject instanceof ActiveSelection) {
        // 多选情况
        stepInfo.selectedObjectIds = activeObject.getObjects().map((obj) => obj.id)
      } else {
        // 单选情况
        stepInfo.selectedObjectIds = [activeObject.id]
      }
    }

    // 指针不在最后，先移除指针以后的step, 再添加
    if (this.historyIndex !== this.historyList.length - 1) {
      this.historyList.splice(this.historyIndex + 1)
    }
    this.historyList.push(stepInfo)
    this.historyIndex = this.historyList.length - 1
  }
  public getHistoryList() {
    return this.historyList!
  }

  /** 恢复选中状态 */
  private restoreSelection(step: IStepInfo) {
    if (!step.selectedObjectIds || step.selectedObjectIds.length === 0) return

    const objects = step.selectedObjectIds
      .map((id) => this.editor.stage.getObjects().find((obj) => obj.id === id))
      .filter((obj) => obj !== undefined)

    if (objects.length === 0) return

    if (objects.length === 1) {
      // 单选
      this.editor.stage.setActiveObject(objects[0])
    } else if (objects.length > 1) {
      // 多选
      const selection = new ActiveSelection(objects, { canvas: this.editor.stage })
      this.editor.stage.setActiveObject(selection)
    }
  }
}
