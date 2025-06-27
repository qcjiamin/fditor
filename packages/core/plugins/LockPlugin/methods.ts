import { FabricObject } from 'fabric'

declare module 'fabric' {
  export interface FabricObject {
    lock(): void
    unlock(): void
    isLock(): boolean
  }
}

FabricObject.prototype.lock = function () {
  const controlNames = Object.keys(this.controls)
  const result = controlNames.reduce(
    (acc, key) => {
      acc[key] = false // 第一个为 true，其余为 false
      return acc
    },
    {} as Record<(typeof controlNames)[number], boolean>
  )

  this.setControlsVisibility({
    ...result,
    lock: true
  })

  this.eset(
    {
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingFlip: true,
      lockScalingX: true,
      lockScalingY: true
    },
    false
  )
}
FabricObject.prototype.unlock = function () {
  const controlNames = Object.keys(this.controls)
  const result = controlNames.reduce(
    (acc, key) => {
      acc[key] = true // 第一个为 true，其余为 false
      return acc
    },
    {} as Record<(typeof controlNames)[number], boolean>
  )

  this.setControlsVisibility({
    ...result,
    lock: false
  })
  this.eset(
    {
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingFlip: false,
      lockScalingX: false,
      lockScalingY: false
    },
    false
  )
}
FabricObject.prototype.isLock = function () {
  return this.lockMovementX === true
}

declare module 'fabric' {
  export interface Cnavas {
    handleSelection(): boolean
  }
}
