// 继承Path
// 限制移动范围

import { FImage } from '@kditor/core'
import { classRegistry, FabricObjectProps, iMatrix, Path, TComplexPathData, TMat2D } from 'fabric'
import { switchPointFromLocalToContainer } from '../utils/mat'

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
    this.belong = options.belong
    this.setControlsVisibility({
      mtr: false
    })

    const tlActionHandler = this.controls.tl.actionHandler
    this.controls.tl.actionHandler = (eventData, transform, x, y) => {
      console.warn(this.type)
      if (this.type !== 'clipframe') {
        tlActionHandler(eventData, transform, x, y)
        return true
      }

      const originImg = this.belong._objects[0]
      // 图片的左上角，由定位转换为画布坐标系的点
      const tlPoint = originImg.getPointByOrigin('left', 'top')
      // 画布坐标系
      const canvasMat = [...iMatrix] as TMat2D

      const imgInContainerMat = originImg.calcTransformMatrix() //取到的坐标系与容器坐标系相同
      const imgInCvsPoint = switchPointFromLocalToContainer(imgInContainerMat, canvasMat, tlPoint)

      // 左上角点的拖拽范围
      // 原始图片的 l
      const l = imgInCvsPoint.x
      const t = imgInCvsPoint.y
      console.error(l, t)
      let tempX = x
      let tempY = y
      if (x < l) {
        tempX = l
      }
      if (y < t) {
        tempY = t
      }

      tlActionHandler(eventData, transform, tempX, tempY)
      // 剪切框固定在右下角

      // 按照宽高计算缩放

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
