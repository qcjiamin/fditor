import { classRegistry, FabricImage, type ImageSource } from 'fabric'
import { ClipContainer, type ClipContainerProps } from './ClipContainer'
import { BunnyController } from '../utils/bunnyController'

export type FVideoPorps = ClipContainerProps & {
  bunnyController: BunnyController
  videoSrc: string
}
export type FVideoOptions = Partial<FVideoPorps>
export class FVideo extends ClipContainer {
  public static type = 'fvideo'
  bunnyController: BunnyController | null = null
  videoSrc: string = ''
  //! 由于继承group的原因，这里默认的活化方法会传入数组
  constructor(image: FabricImage[] | ImageSource, options: FVideoOptions = {}) {
    super(image instanceof Array ? image[0] : new FabricImage(image), options)
  }
  static async fromUrl(url: string, options: FVideoOptions) {
    // 创建迭代控制器
    // 拿到首帧图片
    // const image = await util.loadImage(url, { crossOrigin: 'anonymous' })
    const bunnyCtr = await new BunnyController()
    const image = await bunnyCtr.init(url)

    const customVideo = new this(image as ImageSource, options)
    customVideo.videoSrc = url
    customVideo.bunnyController = bunnyCtr
    customVideo.bunnyController.renderCallback = (canvas) => {
      customVideo.originImage.setElement(canvas as ImageSource)
      customVideo.originImage.set('dirty', true)
      customVideo.canvas?.renderAll()
    }

    return customVideo
  }

  get originImage() {
    return this._objects[0] as FabricImage
  }

  seek(time: number) {
    this.bunnyController?.seek(time)
  }

  // @ts-ignore
  toObject(propertiesToInclude: any[] = []) {
    return super.toObject(['videoSrc', ...propertiesToInclude] as any)
  }

  static async fromObject(options: any) {
    const { videoSrc, objects, ...restOptions } = options
    const fvideo = await FVideo.fromUrl(videoSrc, restOptions)
    if (objects && objects[0]) {
      fvideo.originImage.set(objects[0])
    }
    return fvideo
  }
}

classRegistry.setClass(FVideo, 'fvideo')
classRegistry.setSVGClass(FVideo, 'fvideo')
