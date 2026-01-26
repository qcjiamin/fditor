import { restoreSelection } from '@/stores/utils/util'
import BaseCommand from '@/utils/history/commands/baseCommand'
import type { Editor } from '@fditor/core'

export class SelectCommand extends BaseCommand {
  beforeIds: string[]
  afterIds: string[]
  constructor(beforeIds: string[], afterIds: string[], editor: Editor) {
    super(editor)
    this.beforeIds = beforeIds
    this.afterIds = afterIds
  }
  async do() {
    const obj = restoreSelection(this.afterIds, this.editor.stage)
    // editorStore.setSelected(obj || undefined)
    if (obj) {
      this.editor.stage.setActiveObject(obj)
    } else {
      this.editor.stage.discardActiveObject()
    }
    //! 放在功能方法执行之后，有些情况下[例如多选、拆组]，执行后id才能被查询到
    //todo 拆组、重新建组的id问题需要处理
    // editorStore.setSelected(afterIds)
    this.editor.stage.requestRenderAll()
  }
  async undo() {
    const obj = restoreSelection(this.beforeIds, this.editor.stage)
    // editorStore.setSelected(obj || undefined)
    if (obj) {
      this.editor.stage.setActiveObject(obj)
    } else {
      this.editor.stage.discardActiveObject()
    }
    // editorStore.setSelected(beforeIds)
    this.editor.stage.requestRenderAll()
  }
}
