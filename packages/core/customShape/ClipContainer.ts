// import { Abortable, FabricObject, Group, GroupProps, SerializedGroupProps, TOptions } from 'fabric'
import { classRegistry, FabricObject, Group, GroupProps, iMatrix, Path, Point, Shadow, TMat2D, util } from 'fabric'

export type ClipContainerProps = GroupProps & {}
export type ClipContainerOptions = Partial<ClipContainerProps>
interface tempClipPath extends Path {
  belong?: FabricObject
}

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

/**
 * 将A坐标系的点转换为B坐标系的点
 * @param A
 * @param B
 * @param pointInA
 * @returns
 */
export function switchPointFromCoordinateSystemAToB(A: TMat2D, B: TMat2D, pointInA: Point) {
  // B 的逆矩阵
  const invertB = util.invertTransform(B)
  // B 的逆矩阵 * A 矩阵。 表示 A 坐标系-> 世界坐标系 -> B 坐标系的变化
  // 矩阵乘法是右乘先执行，所以先 A，再转成 B
  const delta = util.multiplyTransformMatrices(invertB, A)
  // 将点A转换到B坐标系下
  const pInB = pointInA.transform(delta)
  return pInB
}

/**
 * 将子坐标系坐标转换为父坐标系坐标
 * @param A
 * @param B
 * @param pointInA
 * @returns
 */
function switchPointFromLocalToContainer(A: TMat2D, B: TMat2D, pointInA: Point) {
  const delta = util.multiplyTransformMatrices(B, A)
  // 将点A转换到B坐标系下
  const pInB = pointInA.transform(delta)
  return pInB
}

/**
 * 将父坐标系坐标转换为子坐标系坐标
 * @param matrixLocal
 * @param pointInContainer
 * @returns
 */
function switchPointFromContainerToLocal(matrixLocal: TMat2D, pointInContainer: Point): Point {
  const invertLocal = util.invertTransform(matrixLocal)
  return pointInContainer.transform(invertLocal)
}

export class ClipContainer extends Group {
  public static type = 'clipContainer'
  private tempClipPath: tempClipPath | null = null
  constructor(object: FabricObject, options: ClipContainerOptions = {}) {
    super([object], options)
  }
  doClip() {
    console.log('start clip')
    // 创建裁剪框
    const w = this.getScaledWidth()
    const h = this.getScaledHeight()
    const path = getRectPath(w, h)
    this.tempClipPath = new Path(path, {
      // stroke: 'red',
      // strokeWidth: 1,
      fill: 'transparent',
      shadow: createClipShadow(),
      angle: this.angle
    }) as tempClipPath
    // 限制裁剪框移动范围
    this.tempClipPath.belong = this

    if (!this.canvas) return
    this.tempClipPath.setPositionByOrigin(this.getPointByOrigin('center', 'center'), 'center', 'center')
    this.canvas._add(this.tempClipPath)
    this.canvas._activeObject = this.tempClipPath
    this.canvas.renderAll()
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
    this.canvas._activeObject = this
    this.canvas.renderAll()

    // 触发修改事件
    this.canvas.fire('def:modified', { target: this })
  }
}

classRegistry.setClass(ClipContainer, 'clipContainer')
classRegistry.setSVGClass(ClipContainer, 'clipContainer')
