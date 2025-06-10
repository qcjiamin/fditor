// 继承Path
// 限制移动范围

import { FImage } from '@kditor/core'
import {
  classRegistry,
  FabricObject,
  FabricObjectProps,
  iMatrix,
  Path,
  Point,
  TComplexPathData,
  TMat2D,
  util
} from 'fabric'
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
    this.on('moving', () => {
      if (this.left < 100) {
        this.set('left', 100)
      }
      this.canvas?.renderAll()
    })
  }
}

classRegistry.setClass(ClipFrame, 'clipFrame')
classRegistry.setSVGClass(ClipFrame, 'clipFrame')
