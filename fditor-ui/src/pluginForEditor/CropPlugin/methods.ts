import type CropPlugin from '@/pluginForEditor/CropPlugin/CropPlugin'
import { Editor } from '@kditor/core'
declare module '@kditor/core' {
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
