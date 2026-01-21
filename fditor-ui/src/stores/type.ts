import type { ElementTypes } from '@/utils/types'

export interface UndoableStates {
  selectedIds: string[]
  fillColor: string
  strokeColor: string
}
export interface Command {
  do: () => Promise<void>
  undo: () => Promise<void>
}

export type DeleteObjInfo = {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: any
  zIndex: number
}
