import Editor from '../../Editor'
import { konvaFill } from '../../types'
import type BackgroundPlugin from './BackgroundPlugin'
import { Shape } from 'konva/lib/Shape'

declare module '@kditor/core' {
  export interface Editor {
    getBgColorShape(): Shape
    updateBgCorlorShape(newShape: Shape): void
    getBackgroundColor(): konvaFill
    setBackgroundColor(color: string): Editor
  }
}

Editor.prototype.getBgColorShape = function () {
  const backgroundPlugin = this.getPlugin('BackgroundPlugin') as BackgroundPlugin
  return backgroundPlugin.bgColor
}

Editor.prototype.updateBgCorlorShape = function (newShape: Shape) {
  const backgroundPlugin = this.getPlugin('BackgroundPlugin') as BackgroundPlugin
  backgroundPlugin.bgColor = newShape
}

Editor.prototype.setBackgroundColor = function (color: string) {
  const backgroundPlugin = this.getPlugin('BackgroundPlugin') as BackgroundPlugin
  if (backgroundPlugin) {
    backgroundPlugin.setBackgroundColor(color)
  }
  return this
}

Editor.prototype.getBackgroundColor = function () {
  const backgroundPlugin = this.getPlugin('BackgroundPlugin') as BackgroundPlugin
  if (backgroundPlugin) {
    return backgroundPlugin.getBackgroundColor() as konvaFill
  } else {
    throw new Error('getBackgroundColor but no backgroundPlugin')
  }
}
