// 引用 Fabric.js 类型扩展，确保所有使用 @fditor/core 的地方都能获得类型扩展
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/fabric/fabric.d.ts" />
import Editor from './Editor'
// export default Editor

import SelectionPlugin from './plugins/SelectionPlugin/SelectionPlugin'
import AlignPlugin from './plugins/AlignPlugin/AlignPlugin'
import WorkspacePlugin from './plugins/WorkspacePlugin/WorkspacePlugin'
import LockPlugin from './plugins/LockPlugin/LockPlugin'
import SnapPlugin from './plugins/SnapPlugin/SnapPlugin'
import PencilPlugin from './plugins/PencilPlugin/PencilPlugin'
import PenPlugin from './plugins/PenPlugin/penPlugin'
export * from './types/common/types'
export * from './helper/index'
export * from './utils/typeAssertions'

export * from './customShape/FImage'
export * from './customShape/FCanvas'
export * from './customShape/FTextBox'
export * from './customShape/FLine'
export * from './customShape/FPath'
export * from './customShape/FRect'
export * from './customShape/FTriangle'
export * from './customShape/FHexagon'

export { Editor, WorkspacePlugin, AlignPlugin, SelectionPlugin, LockPlugin, SnapPlugin, PencilPlugin, PenPlugin }
