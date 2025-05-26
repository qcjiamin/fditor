import { Editor } from '@kditor/core'
import type { IStepInfo } from '@/pluginForEditor/HistoryPlugin/type'
import type HistoryPlugin from '@/pluginForEditor/HistoryPlugin/HistoryPlugin'

declare module '@kditor/core' {
  export interface Editor {
    undo(): void
    redo(): void
    addStep(stepInfo: IStepInfo): void
  }
}
//! 业务逻辑？
// 类似speechInfo，如果step需要，就先挂载在Editor上？

Editor.prototype.undo = function () {
  const historyPlugin = this.getPlugin<HistoryPlugin>('HistoryPlugin') as HistoryPlugin
  if (historyPlugin) {
    historyPlugin.undo()
  }
}
Editor.prototype.redo = function () {
  const historyPlugin = this.getPlugin<HistoryPlugin>('HistoryPlugin') as HistoryPlugin
  if (historyPlugin) {
    historyPlugin.redo()
  }
}
Editor.prototype.addStep = function (stepInfo) {
  const historyPlugin = this.getPlugin<HistoryPlugin>('HistoryPlugin') as HistoryPlugin
  if (historyPlugin) {
    historyPlugin.addStep(stepInfo)
  }
}
