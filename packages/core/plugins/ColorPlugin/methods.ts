import { Editor } from '@kditor/core'
import ColorPlugin from './ColorPlugin'

declare module '@kditor/core' {
  export interface Editor {
    getFill(): void
    setFill(val: string): void
  }
}

Editor.prototype.getFill = function () {
  const alignPlugin = this.getPlugin<ColorPlugin>('AlignPlugin') as ColorPlugin
  if (alignPlugin) {
    alignPlugin.getFill()
  }
}

Editor.prototype.setFill = function (val: string) {
  const alignPlugin = this.getPlugin<ColorPlugin>('AlignPlugin') as ColorPlugin
  if (alignPlugin) {
    alignPlugin.setFill(val)
  }
}
