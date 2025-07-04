import Editor from './Editor'
// export default Editor

import SelectionPlugin from './plugins/SelectionPlugin/SelectionPlugin'
import AlignPlugin from './plugins/AlignPlugin/AlignPlugin'
import WorkspacePlugin from './plugins/WorkspacePlugin/WorkspacePlugin'
import LockPlugin from './plugins/LockPlugin/LockPlugin'
export * from './types'
export * from './helper/index'

export * from './customShape/FImage'
export * from './customShape/FCanvas'
export * from './customShape/FTextBox'
export * from './customShape/FLine'
export * from './customShape/FPath'
export * from './customShape/FRect'

export { Editor, WorkspacePlugin, AlignPlugin, SelectionPlugin, LockPlugin }
