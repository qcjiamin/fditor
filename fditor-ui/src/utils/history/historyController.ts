//? 为什么没有采用类管理
// 与store结合时，用类管理会更加复杂
import type BaseCommand from '@/utils/history/commands/baseCommand'

class HistoryController {
  private _history: BaseCommand[] = []
  private _historyIndex: number = -1
  private _historyLimit: number = 100
  constructor() {
    this.clear()
  }
  clear() {
    this._history = []
    this._historyIndex = -1
  }
  async undo() {
    if (this.canUndo) {
      await this._history[this._historyIndex].undo()
      this._historyIndex--
    }
  }
  async redo() {
    if (this.canRedo) {
      this._historyIndex++
      await this._history[this._historyIndex].do()
    }
  }
  async push(command: BaseCommand) {
    if (this._historyIndex < this._history.length - 1) {
      this._history = this._history.slice(0, this._historyIndex + 1)
    }
    this._history.push(command)
    this._historyIndex++
    if (this._history.length > this._historyLimit) {
      this._history.shift()
      this._historyIndex--
    }
    await command.do()
  }
  get historyIndex() {
    return this._historyIndex
  }
  get canUndo() {
    return this._historyIndex >= 0
  }
  get canRedo() {
    return this._historyIndex < this._history.length - 1
  }
}

export default HistoryController
