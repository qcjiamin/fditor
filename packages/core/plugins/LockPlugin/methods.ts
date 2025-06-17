import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    lock(): void
    unlock(): void
    isLock(): boolean
  }
}

FabricObject.prototype.lock = function () {
  this.lockMovementX = false
  this.lockMovementY = false
  this.lockRotation = false
  this.lockScalingFlip = false
  this.lockScalingX = false
  this.lockScalingY = false
  this.setControlsVisibility({})
  // setControlsByObj(that)
}
FabricObject.prototype.unlock = function () {
  this.lockMovementX = true
  this.lockMovementY = true
  this.lockRotation = true
  this.lockScalingFlip = true
  this.lockScalingX = true
  this.lockScalingY = true
}
FabricObject.prototype.isLock = function () {
  return this.lockMovementX === false
}

// Editor.prototype.alignLeft = function () {
//   const alignPlugin = this.getPlugin<AlignPlugin>('AlignPlugin') as AlignPlugin
//   if (alignPlugin) {
//     alignPlugin.alignLeft()
//   }
// }
