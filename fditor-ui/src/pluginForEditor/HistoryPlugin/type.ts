export interface IStepInfo {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any
  // 保存选中对象的 ID 数组，用于 undo/redo 时恢复选中状态
  selectedObjectIds?: string[]
}
