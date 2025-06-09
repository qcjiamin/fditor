import { classRegistry, FabricImage, ImageSource, util } from 'fabric'
import { ClipContainer, ClipContainerProps } from './ClipContainer'

export type FimagePorps = ClipContainerProps & {}
export type FimageOptions = Partial<FimagePorps>
export class FImage extends ClipContainer {
  public static type = 'fimage'
  constructor(image: FabricImage | ImageSource, options: FimageOptions = {}) {
    super(image instanceof FabricImage ? image : new FabricImage(image), options)
  }
  static async fromUrl(url: string, options: FimageOptions) {
    const image = await util.loadImage(url, { crossOrigin: 'anonymous' })
    return new this(image, options)
  }
}

classRegistry.setClass(FImage, 'fimage')
classRegistry.setSVGClass(FImage, 'fimage')
