import { EditorKey } from '@/constants/injectKey'
import { inject } from 'vue'

export const useHistory = () => {
  const editor = inject(EditorKey)
  editor!.on('node:modified', () => {})
}
