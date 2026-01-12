import type { UndoableStates } from '@/stores/type'
import { reactive } from 'vue'

export const undoableStates: UndoableStates = reactive({
  fillColor: '#ffffff',
  strokeColor: '#000000',
  selectedId: ''
})
