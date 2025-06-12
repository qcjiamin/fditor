// 继承Path
// 限制移动范围

import { FImage } from '@kditor/core'
import { classRegistry, FabricObjectProps, iMatrix, Path, Point, TComplexPathData, TMat2D } from 'fabric'
import { switchPointFromContainerToLocal, switchPointFromLocalToContainer } from '../utils/mat'

// 添加一些对象自己需要的属性
interface UniqueClipFrameProps {
  belong: FImage
}
export type IClipFrameProps = Partial<FabricObjectProps> & UniqueClipFrameProps
// 显示缩放范围
export class ClipFrame extends Path {
  public static type = 'clipFrame'
  public belong: FImage
  constructor(path: TComplexPathData | string, options: IClipFrameProps) {
    super(path, options)
    this.flipX = false
    this.flipY = false
    this.strokeWidth = 0
    // this.objectCaching = false
    this.belong = options.belong
    this.setControlsVisibility({
      mtr: false
    })

    const tlActionHandler = this.controls.tl.actionHandler
    this.controls.tl.actionHandler = (eventData, transform, x, y) => {
      if (this.type !== 'clipframe') {
        tlActionHandler(eventData, transform, x, y)
        return true
      }

      const belongScaleX = this.belong.scaleX
      const belongScaleY = this.belong.scaleY
      const originImg = this.belong._objects[0]
      // 图片的左上角，由定位转换为画布坐标系的点
      const tlPointInContainer = originImg.getPointByOrigin('left', 'top')
      // 画布坐标系
      // const canvasMat = [...iMatrix] as TMat2D
      const imgInContainerMat = originImg.calcTransformMatrix() //取到的坐标系与容器坐标系相同
      const mousePointInContainer = switchPointFromContainerToLocal(imgInContainerMat, new Point(x, y))

      const brPoint = this.getPointByOrigin('right', 'bottom')
      const brPointInContainer = switchPointFromContainerToLocal(imgInContainerMat, brPoint)
      const tlRange = {
        t: tlPointInContainer.y,
        l: tlPointInContainer.x,
        r: brPointInContainer.x,
        b: brPointInContainer.y
      }
      let tempX = mousePointInContainer.x
      let tempY = mousePointInContainer.y
      if (mousePointInContainer.x < tlRange.l) tempX = tlRange.l
      if (mousePointInContainer.x > tlRange.r) tempX = tlRange.r
      if (mousePointInContainer.y < tlRange.t) tempY = tlRange.t
      if (mousePointInContainer.y > tlRange.b) tempY = tlRange.b

      // 自己实现缩放逻辑
      //! 上面的点的计算排除了缩放值。tlRange是未考虑缩放的范围，计算出的toW是容器坐标系下的Width
      //! 但是this是在画布坐标系下，因此需要乘以 belongScale（即裁剪框如果进入容器，会继承容器的scale来渲染）
      const toW = Math.abs(tlRange.r - tempX) * belongScaleX
      const toH = Math.abs(tlRange.b - tempY) * belongScaleY
      // 记录右下角点
      this.set('scaleX', toW / this.width)
      this.set('scaleY', toH / this.height)
      // 以右下角为基点设置定位
      this.setPositionByOrigin(brPoint, 'right', 'bottom')

      return true
    }

    const trActionHandler = this.controls.tr.actionHandler
    this.controls.tr.actionHandler = (eventData, transform, x, y) => {
      if (this.type !== 'clipframe') {
        trActionHandler(eventData, transform, x, y)
        return true
      }

      const belongScaleX = this.belong.scaleX
      const belongScaleY = this.belong.scaleY
      const originImg = this.belong._objects[0]
      // 图片的左上角，由定位转换为画布坐标系的点
      const movePointInContainer = originImg.getPointByOrigin('right', 'top')
      const imgInContainerMat = originImg.calcTransformMatrix() //取到的坐标系与容器坐标系相同
      const mousePointInContainer = switchPointFromContainerToLocal(imgInContainerMat, new Point(x, y))

      const acrossPoint = this.getPointByOrigin('left', 'bottom')
      const acrossPointInContainer = switchPointFromContainerToLocal(imgInContainerMat, acrossPoint)
      const tlRange = {
        t: movePointInContainer.y,
        l: acrossPointInContainer.x,
        r: movePointInContainer.x,
        b: acrossPointInContainer.y
      }
      let tempX = mousePointInContainer.x
      let tempY = mousePointInContainer.y
      if (mousePointInContainer.x < tlRange.l) tempX = tlRange.l
      if (mousePointInContainer.x > tlRange.r) tempX = tlRange.r
      if (mousePointInContainer.y < tlRange.t) tempY = tlRange.t
      if (mousePointInContainer.y > tlRange.b) tempY = tlRange.b

      // 自己实现缩放逻辑
      const toW = Math.abs(tempX - tlRange.l) * belongScaleX
      const toH = Math.abs(tlRange.b - tempY) * belongScaleY
      // 记录右下角点
      this.set('scaleX', toW / this.width)
      this.set('scaleY', toH / this.height)
      // 以右下角为基点设置定位
      this.setPositionByOrigin(acrossPoint, 'left', 'bottom')
      return true
    }

    const blActionHandler = this.controls.bl.actionHandler
    this.controls.bl.actionHandler = (eventData, transform, x, y) => {
      if (this.type !== 'clipframe') {
        blActionHandler(eventData, transform, x, y)
        return true
      }

      const belongScaleX = this.belong.scaleX
      const belongScaleY = this.belong.scaleY
      const originImg = this.belong._objects[0]
      // 图片的左上角，由定位转换为画布坐标系的点
      const movePointInContainer = originImg.getPointByOrigin('left', 'bottom')
      const imgInContainerMat = originImg.calcTransformMatrix() //取到的坐标系与容器坐标系相同
      const mousePointInContainer = switchPointFromContainerToLocal(imgInContainerMat, new Point(x, y))

      const acrossPoint = this.getPointByOrigin('right', 'top')
      const acrossPointInContainer = switchPointFromContainerToLocal(imgInContainerMat, acrossPoint)
      const tlRange = {
        t: acrossPointInContainer.y,
        l: movePointInContainer.x,
        r: acrossPointInContainer.x,
        b: movePointInContainer.y
      }
      let tempX = mousePointInContainer.x
      let tempY = mousePointInContainer.y
      if (mousePointInContainer.x < tlRange.l) tempX = tlRange.l
      if (mousePointInContainer.x > tlRange.r) tempX = tlRange.r
      if (mousePointInContainer.y < tlRange.t) tempY = tlRange.t
      if (mousePointInContainer.y > tlRange.b) tempY = tlRange.b

      // 自己实现缩放逻辑
      const toW = Math.abs(tlRange.r - tempX) * belongScaleX
      const toH = Math.abs(tempY - tlRange.t) * belongScaleY
      // 记录右下角点
      this.set('scaleX', toW / this.width)
      this.set('scaleY', toH / this.height)
      // 以右下角为基点设置定位
      this.setPositionByOrigin(acrossPoint, 'right', 'top')
      return true
    }

    const brActionHandler = this.controls.br.actionHandler
    this.controls.br.actionHandler = (eventData, transform, x, y) => {
      if (this.type !== 'clipframe') {
        brActionHandler(eventData, transform, x, y)
        return true
      }

      const belongScaleX = this.belong.scaleX
      const belongScaleY = this.belong.scaleY
      const originImg = this.belong._objects[0]
      // 图片的左上角，由定位转换为画布坐标系的点
      const movePointInContainer = originImg.getPointByOrigin('right', 'bottom')
      const imgInContainerMat = originImg.calcTransformMatrix() //取到的坐标系与容器坐标系相同
      const mousePointInContainer = switchPointFromContainerToLocal(imgInContainerMat, new Point(x, y))

      const acrossPoint = this.getPointByOrigin('left', 'top')
      const acrossPointInContainer = switchPointFromContainerToLocal(imgInContainerMat, acrossPoint)
      const tlRange = {
        t: acrossPointInContainer.y,
        l: acrossPointInContainer.x,
        r: movePointInContainer.x,
        b: movePointInContainer.y
      }
      let tempX = mousePointInContainer.x
      let tempY = mousePointInContainer.y
      if (mousePointInContainer.x < tlRange.l) tempX = tlRange.l
      if (mousePointInContainer.x > tlRange.r) tempX = tlRange.r
      if (mousePointInContainer.y < tlRange.t) tempY = tlRange.t
      if (mousePointInContainer.y > tlRange.b) tempY = tlRange.b

      // 自己实现缩放逻辑
      const toW = Math.abs(tempX - tlRange.l) * belongScaleX
      const toH = Math.abs(tempY - tlRange.t) * belongScaleY
      // 记录右下角点
      this.set('scaleX', toW / this.width)
      this.set('scaleY', toH / this.height)
      // 以右下角为基点设置定位
      this.setPositionByOrigin(acrossPoint, 'left', 'top')
      return true
    }

    // 重写control拖拽逻辑
    //todo: 不从事件，从移动方法中hook
    this.on('moving', () => {
      // 获取底图范围
      const originImg = this.belong._objects[0]
      //! 这里拿到的imgMat是以 [[!!!原图中心点为原点的坐标系]]
      const originImgMat = originImg.calcTransformMatrix()
      // 图片center是相对与容器坐标系的
      // const originImgCenter = originImg.getPointByOrigin('center', 'center')
      //? originImg.getPointByOrigin('center', 'center') 在裁剪情况下取的是图片现对于容器范围的定位
      //? 在以原图坐标系为对比坐标系的情况下，原图的中心点始终是 0，0
      const originImgCenter = new Point(0, 0)
      const thisCenter = this.getPointByOrigin('center', 'center')
      const thisCenterInImg = switchPointFromContainerToLocal(originImgMat, thisCenter)
      //获取原始图片宽高
      const imgW = originImg.getScaledWidth()
      const imgH = originImg.getScaledHeight()
      // 获取裁剪框宽高
      //! thisW 需要排除 belong.scaleX 的影响，因为原始图片的范围是排除了 belong.scaleX 缩放的
      //! 因为都基于容器坐标系做计算，因此需要统一缩放情况。this 的缩放是基于canvas的
      //! 与control 类似，在统一到容器坐标系下计算时要特别注意 scale 的影响
      const thisW = this.getScaledWidth() / this.belong.scaleX
      const thisH = this.getScaledHeight() / this.belong.scaleY

      // this的center移动范围
      const l = originImgCenter.x - (imgW - thisW) / 2
      const r = originImgCenter.x + (imgW - thisW) / 2
      const t = originImgCenter.y - (imgH - thisH) / 2
      const b = originImgCenter.y + (imgH - thisH) / 2

      // 通过比对中心点判断是否越界

      let toCenterX = thisCenterInImg.x
      let toCenterY = thisCenterInImg.y

      if (thisCenterInImg.x < l) toCenterX = l
      if (thisCenterInImg.x > r) toCenterX = r
      if (thisCenterInImg.y < t) toCenterY = t
      if (thisCenterInImg.y > b) toCenterY = b

      // 将toCenter转回画布坐标系，设置
      const cvsMat = [...iMatrix] as TMat2D
      const toPoint = switchPointFromLocalToContainer(originImgMat, cvsMat, new Point(toCenterX, toCenterY))
      this.setPositionByOrigin(toPoint, 'center', 'center')
      this.dirty = true
      this.canvas?.renderAll()
    })
  }
}

classRegistry.setClass(ClipFrame, 'clipFrame')
classRegistry.setSVGClass(ClipFrame, 'clipFrame')
