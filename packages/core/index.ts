import Editor from './Editor'
// export default Editor

import SelectionPlugin from './plugins/SelectionPlugin/SelectionPlugin'
import AlignPlugin from './plugins/AlignPlugin/AlignPlugin'
import BackgroundPlugin from './plugins/BackgroundPlugin/BackgroundPlugin'
import WorkspacePlugin from './plugins/WorkspacePlugin/WorkspacePlugin'
export * from './types'
export * from './helper/index'

export * from './customShape/FImage'

export { Editor, WorkspacePlugin, AlignPlugin, BackgroundPlugin, SelectionPlugin }
