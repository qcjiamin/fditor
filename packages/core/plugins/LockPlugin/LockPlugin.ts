// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import type { IPlugin } from '../../types'
import './methods'
import { Control, FabricObject, util } from 'fabric'
import { ControlRenderParams } from './type'

type ControlActionParams = Parameters<typeof Control.prototype.actionHandler>

function unLockObject(eventData: ControlActionParams[0], transform: ControlActionParams[1]) {}
function renderIcon(
  ctx: ControlRenderParams[0],
  left: ControlRenderParams[1],
  top: ControlRenderParams[2],
  styleOverride: ControlRenderParams[3],
  fabricObject: ControlRenderParams[4]
) {
  const cvs = fabricObject.canvas

  const size = 30
  ctx.save()
  ctx.translate(left, top)
  ctx.rotate(util.degreesToRadians(fabricObject.angle))
  const img = document.querySelector('#lockimg')
  ctx.drawImage(img, -size / 2, -size / 2, 40, 40)
  ctx.restore()
}

export default class LockPlugin implements IPlugin {
  #name: string = 'LockPlugin'
  public editor!: Editor
  constructor() {}
  get name() {
    return this.#name
  }
  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)

    FabricObject.prototype.controls.lock = new Control({
      x: 0.5,
      y: 0.5,
      offsetY: 0,
      cursorStyle: 'pointer',
      mouseUpHandler: unLockObject,
      render: renderIcon
    })
  }
}
