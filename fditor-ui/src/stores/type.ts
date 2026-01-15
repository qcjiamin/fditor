export interface UndoableStates {
  selectedIds: string[]
  fillColor: string
  strokeColor: string
}
export interface Command {
  do: () => Promise<void>
  undo: () => Promise<void>
}
