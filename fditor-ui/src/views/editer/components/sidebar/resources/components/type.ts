/** 拖拽列表子项属性 */
export type draggableListItem = {
  id: string
  url: string
  // 选中的id
  selected: boolean
}

/** 拖拽排序事件参数 */
export type dragSortEvent = {
  id: string
  from: number
  to: number
}
