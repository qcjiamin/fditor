import { classRegistry, FabricObject, Group, type GroupProps, iMatrix, Point, Shadow, type TMat2D, util } from 'fabric'
import { ClipFrame } from './ClipFrame'
import { switchPointFromContainerToLocal, switchPointFromLocalToContainer } from '../utils/mat'

export type ClipContainerProps = GroupProps & {}
export type ClipContainerOptions = Partial<ClipContainerProps>

function getRectPath(width: number, height: number) {
  return `M0 0 H${width} V${height} H0 Z`
}
function createClipShadow() {
  return new Shadow({
    color: '#00000066',
    blur: 7,
    offsetX: 0,
    offsetY: 0,
    nonScaling: true
  })
}

type ClipResolve<T> = (value: T | PromiseLike<T>) => void

// type ClipReject = (reason?: any) => void

export class ClipContainer extends Group {
  public static type = 'clipContainer'
  private tempClipPath: ClipFrame | null = null
  private clipPromise: Promise<null> | null = null
  private resolveClip: ClipResolve<null> | null = null
  // private rejectClip: ClipReject | null = null
  private lastClipPath: FabricObject | null = null
  constructor(object: FabricObject, options: ClipContainerOptions = {}) {
    super([object], options)
  }
  doClip() {
    this.clipPromise = new Promise((resolve) => {
      this.resolveClip = resolve
      // this.rejectClip = reject
    })
    //! 开始时禁用 objectCaching 配置；为了解决取消clippath时底图渲染异常的问题
    this.objectCaching = false
    // 创建裁剪框
    const w = this.getScaledWidth()
    const h = this.getScaledHeight()
    const path = getRectPath(w, h)

    this.tempClipPath = new ClipFrame(path, {
      belong: this,
      fill: 'transparent',
      shadow: createClipShadow(),
      angle: this.angle
    })

    this.tempClipPath.on('deselected', () => {
      this.canvas?.fire('confirm:clip', this.tempClipPath!)
    })

    if (!this.canvas) throw Error('Execute the clip, but there is no canvas object.')
    this.tempClipPath.setPositionByOrigin(this.getPointByOrigin('center', 'center'), 'center', 'center')
    this.canvas._add(this.tempClipPath)

    if (this.clipPath) {
      this.lastClipPath = this.clipPath as FabricObject
      //! objectCaching = false 重要，不然底图显示不完整
      // this.objectCaching = false
      this.set('clipPath', undefined)
    }

    this.canvas._activeObject = this.tempClipPath
    this.canvas.renderAll()
    return this.clipPromise
  }
  async confirmClip() {
    // 实装裁剪框
    if (!this.tempClipPath) return
    if (!this.canvas) return

    // 画布坐标系
    const canvasMat = [...iMatrix] as TMat2D

    //! 拿到裁剪前原始图片相对于画布的定位, 这个定位在应用裁剪后需要保持不变
    const originImg = this._objects[0]
    const imgInContainerMat = originImg.calcTransformMatrix() //取到的坐标系与容器坐标系相同
    // const containerInCvsMat = this.calcTransformMatrix()
    const originImageInCanvas = switchPointFromLocalToContainer(
      imgInContainerMat,
      canvasMat,
      new Point(originImg.left, originImg.top)
    )

    const clone = await this.tempClipPath.clone()
    //! 先设置缩放，再计算top，left, 因为会改变局部变换矩阵
    clone.set({
      fill: 'black',
      scaleX: clone.scaleX / this.scaleX,
      scaleY: clone.scaleY / this.scaleY,
      angle: 0
    })

    //! thisMat 应该是裁剪过后的变换矩阵，而不是裁剪前的变换矩阵
    // const thisMat = this.calcTransformMatrix()
    // 拼装出一个裁剪完成后的变换矩阵, 对象的变换矩阵在fabric中默认是以中心点为平移变换的
    const thisMat = util.composeMatrix({
      translateX: this.tempClipPath.getCenterPoint().x,
      translateY: this.tempClipPath.getCenterPoint().y,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      angle: this.angle,
      flipX: false,
      flipY: false,
      skewX: undefined,
      skewY: undefined
    })
    const pointInCvs = clone.getPointByOrigin('left', 'top')
    const pointInThis = switchPointFromContainerToLocal(thisMat, pointInCvs)
    //! 最简单的设置定位方式 -(clone.getScaledWidth() / 2)
    // clone.left = -(clone.getScaledWidth() / 2)
    // clone.top = -(clone.getScaledHeight() / 2)
    clone.set({
      left: pointInThis.x,
      top: pointInThis.y
    })

    const toW = this.tempClipPath.getScaledWidth() / this.scaleX
    const toH = this.tempClipPath.getScaledHeight() / this.scaleY
    const toL = this.tempClipPath.left
    const toT = this.tempClipPath.top
    this.canvas._remove(this.tempClipPath)
    this.tempClipPath = null
    this.set({
      clipPath: clone,
      width: toW,
      height: toH,
      left: toL,
      top: toT
    })
    this.setCoords()

    // 底图移动回原位
    const _imgInContainerMat = originImg.calcTransformMatrix()
    const _originImageInContainer = switchPointFromContainerToLocal(_imgInContainerMat, originImageInCanvas)
    originImg.set({
      left: _originImageInContainer.x,
      top: _originImageInContainer.y
    })
    //! 裁剪完选中被裁剪的图片，使用事件版本是为了让外部同步状态 点击空白(画布内、外)处 -> confirmClip -> 通知外部选中元素切换
    // this.canvas._activeObject = this
    this.canvas.setActiveObject(this)
    //! 恢复 objectCaching 配置
    this.objectCaching = true
    this.canvas.renderAll()
    if (this.resolveClip) {
      this.resolveClip(null)
    }
  }

  private restoreClipPath() {
    if (this.lastClipPath) {
      this.set('clipPath', this.lastClipPath)
      this.lastClipPath = null
    }
  }

  cancelClip() {
    if (!this.canvas) throw Error('no canvas')
    if (!this.tempClipPath) throw Error('no tempClipPath')
    this.canvas._remove(this.tempClipPath)
    this.tempClipPath = null
    //? 裁剪完选中被裁剪的图片
    // this.canvas._activeObject = this
    this.restoreClipPath()
    this.canvas.setActiveObject(this)
    this.objectCaching = true
    this.canvas.renderAll()
    if (this.resolveClip) {
      this.resolveClip(null)
    }
  }

  doFlip(dir: 'x' | 'y') {
    // 图片是翻转的 CustomImage._objects[0] 的真实图片
    // 1.5 形状裁剪框宽度的一半
    //? 这里先不考虑storkeWidth
    // const offsetBorder = 1.5
    if (dir === 'x') {
      if (this.clipPath) {
        let clippathAndImgLeftOffset = Math.abs(Math.abs(this.clipPath.left) - Math.abs(this._objects[0].left))
        clippathAndImgLeftOffset = parseFloat(clippathAndImgLeftOffset.toFixed(2))
        let clippathAndImgRightOffset =
          this._objects[0].width - this.clipPath.getScaledWidth() - clippathAndImgLeftOffset
        clippathAndImgRightOffset = parseFloat(clippathAndImgRightOffset.toFixed(2))
        // 将将实际图片翻转
        this._objects[0].flipX = !this._objects[0].flipX
        // 裁剪框的左边界与图片的左边界的差距
        // 让翻转后的右边距离与翻转前的左边距离相等，通过移动图片来实现
        if (clippathAndImgLeftOffset < clippathAndImgRightOffset) {
          // 图片往左移动
          this._objects[0].left = this._objects[0].left - (clippathAndImgRightOffset - clippathAndImgLeftOffset)
        } else {
          // 图片往右移动
          this._objects[0].left = this._objects[0].left + (clippathAndImgLeftOffset - clippathAndImgRightOffset)
        }
      } else {
        this._objects[0].flipX = !this._objects[0].flipX
      }
    } else if (dir === 'y') {
      if (this.clipPath) {
        let clippathAndImgTopOffset = Math.abs(Math.abs(this.clipPath.top) - Math.abs(this._objects[0].top))
        clippathAndImgTopOffset = parseFloat(clippathAndImgTopOffset.toFixed(2))
        let clippathAndImgBottomOffset =
          this._objects[0].height - this.clipPath.getScaledHeight() - clippathAndImgTopOffset
        clippathAndImgBottomOffset = parseFloat(clippathAndImgBottomOffset.toFixed(2))
        // 将将实际图片翻转
        this._objects[0].flipY = !this._objects[0].flipY
        if (clippathAndImgTopOffset < clippathAndImgBottomOffset) {
          // 图片往上移动
          this._objects[0].top = this._objects[0].top - (clippathAndImgBottomOffset - clippathAndImgTopOffset)
        } else {
          // 图片往下移动
          this._objects[0].top = this._objects[0].top + (clippathAndImgTopOffset - clippathAndImgBottomOffset)
        }
      } else {
        this._objects[0].flipY = !this._objects[0].flipY
      }
    }
    this.set('dirty', true)
    // 发送事件通知外部自己修改了
    if (!this.canvas) {
      console.warn('execute the flip, but there is no canvas object.')
      return
    }
    this.canvas.fire('def:modified', { target: this })
  }
}

classRegistry.setClass(ClipContainer, 'clipContainer')
classRegistry.setSVGClass(ClipContainer, 'clipContainer')
