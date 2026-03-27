//todo: 裁剪的蒙版状态
import { classRegistry, FabricImage, type ImageSource, util } from 'fabric'
import { ClipContainer, type ClipContainerProps } from './ClipContainer'

export type FVideoPorps = ClipContainerProps & {}
export type FVideoOptions = Partial<FVideoPorps>
export class FVideo extends ClipContainer {
  public static type = 'fimage'
  //! 由于继承group的原因，这里默认的活化方法会传入数组
  constructor(image: FabricImage[] | ImageSource, options: FVideoOptions = {}) {
    super(image instanceof Array ? image[0] : new FabricImage(image), options)
  }
  static async fromUrl(url: string, options: FVideoOptions) {
    const image = await util.loadImage(url, { crossOrigin: 'anonymous' })

    return new this(image, options)
  }
}

classRegistry.setClass(FVideo, 'fimage')
classRegistry.setSVGClass(FVideo, 'fimage')
