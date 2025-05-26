interface IStepInfo {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any
}

class History {
  private historyList: IStepInfo[]
  private historyIndex: number
  constructor() {
    this.historyList = []
    this.historyIndex = 0
  }
  public undo() {
    if (this.historyIndex === 0) return
    this.historyIndex--
    // 拿到步骤，判断做什么
    const step = this.historyList[this.historyIndex]
    if (step.type === 'modify') {
      // 执行渲染？
      // 通知执行渲染？
    }
  }
  public redo() {
    if (this.historyIndex === this.historyList.length - 1) return
    this.historyIndex++
  }
  public addStep(stepInfo: IStepInfo) {
    // 指针不在最后，先移除指针以后的step, 再添加
    if (this.historyIndex !== this.historyList.length - 1) {
      this.historyList.splice(this.historyIndex)
    }
    this.historyList.push(stepInfo)
  }
}
