import { classRegistry, FabricImage, type ImageSource } from 'fabric'
import { ClipContainer, type ClipContainerProps } from './ClipContainer'
import { BunnyController } from '../utils/bunnyController'
import { objectCommonProperties } from '../utils/constant'

export type FVideoPorps = ClipContainerProps & {
  bunnyController: BunnyController
  videoSrc: string
}
export type FVideoOptions = Partial<FVideoPorps>
export class FVideo extends ClipContainer {
  public static type = 'fvideo'
  public static customProperties: string[] = [
    ...objectCommonProperties,
    'videoSrc',
  ]
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
    const tempJSON = super.toObject([...propertiesToInclude] as any)
    // 序列化需要移除OriginImage 的src, 因为在视频里是base64格式的,反序列化时会重新通过视频创建图源
    ;(tempJSON.objects[0] as any).src = ''
    return tempJSON
  }

  static async fromObject(options: any) {
    // 调用父类的 fromObject，能够全自动处理所有 Fabric 特性（包括 layoutManager、clipPath 等）的反序列化
    const fvideo = (await super.fromObject(options)) as FVideo
    
    // 重新拉起视频源控制器，恢复视频解析画布
    const bunnyCtr = new BunnyController()
    const image = await bunnyCtr.init(options.videoSrc)
    
    // 将真实视频源的画布替换到反序列化回来的 originImage 对象里，并重新挂载控制器及渲染回调
    fvideo.originImage.setElement(image as ImageSource)
    fvideo.videoSrc = options.videoSrc
    fvideo.bunnyController = bunnyCtr
    fvideo.bunnyController.renderCallback = (canvas) => {
      fvideo.originImage.setElement(canvas as ImageSource)
      fvideo.originImage.set('dirty', true)
      fvideo.canvas?.renderAll()
    }
    
    return fvideo
  }
}

classRegistry.setClass(FVideo, 'fvideo')
classRegistry.setSVGClass(FVideo, 'fvideo')
window.FVideo = FVideo