import { FabricImage, Point, util } from 'fabric'

const { sizeAfterTransform, calcDimensionsMatrix } = util
// eslint-disable-next-line @typescript-eslint/no-explicit-any
FabricImage.prototype._getTransformedDimensions = function (options: any = {}): Point {
  const dimOptions = {
    // if scaleX or scaleY are negative numbers,
    // this will return dimensions that are negative.
    // and this will break assumptions around the codebase
    scaleX: this.scaleX,
    scaleY: this.scaleY,
    skewX: this.skewX,
    skewY: this.skewY,
    width: this.width,
    height: this.height,
    strokeWidth: this.strokeWidth,
    // TODO remove this spread. is visible in the performance inspection
    ...options
  }
  if (this.clipPath) {
    dimOptions.width = this.clipPath.width
    dimOptions.height = this.clipPath.height
  }
  // stroke is applied before/after transformations are applied according to `strokeUniform`
  const strokeWidth = dimOptions.strokeWidth
  let preScalingStrokeValue = strokeWidth,
    postScalingStrokeValue = 0

  if (this.strokeUniform) {
    preScalingStrokeValue = 0
    postScalingStrokeValue = strokeWidth
  }
  const dimX = dimOptions.width + preScalingStrokeValue,
    dimY = dimOptions.height + preScalingStrokeValue,
    noSkew = dimOptions.skewX === 0 && dimOptions.skewY === 0
  let finalDimensions
  if (noSkew) {
    finalDimensions = new Point(dimX * dimOptions.scaleX, dimY * dimOptions.scaleY)
  } else {
    finalDimensions = sizeAfterTransform(dimX, dimY, calcDimensionsMatrix(dimOptions))
  }

  return finalDimensions.scalarAdd(postScalingStrokeValue)
}
