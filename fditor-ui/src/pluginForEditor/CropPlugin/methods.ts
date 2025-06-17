import type CropPlugin from '@/pluginForEditor/CropPlugin/CropPlugin'
import { Editor } from '@fditor/core'
declare module '@fditor/core' {
  export interface Editor {
    enterCrop(): void
  }
}

Editor.prototype.enterCrop = function () {
  const CropPlugin = this.getPlugin<CropPlugin>('CropPlugin') as CropPlugin
  if (CropPlugin) {
    CropPlugin.enterCrop()
  }
}
