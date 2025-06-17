import { Editor } from '@fditor/core'
import type AlignPlugin from './AlignPlugin'

// declare module '@fditor/core' {
//   export interface Editor {
//     alignLeft(): void
//   }
// }

// Editor.prototype.alignLeft = function () {
//   const alignPlugin = this.getPlugin<AlignPlugin>('AlignPlugin') as AlignPlugin
//   if (alignPlugin) {
//     alignPlugin.alignLeft()
//   }
// }
