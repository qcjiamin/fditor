// import Editor from '../../Editor'
import { Editor } from '@fditor/core'
import type { IPlugin } from '@fditor/core'
import './methods.ts'
import { ElementType } from '@/utils/types.ts'
import { Point, util } from 'fabric'
// import { mat3, vec2 } from 'gl-matrix'
import type { TMat2D } from 'fabric'

/**
 * 将子坐标系坐标转换为父坐标系坐标
 * @param A
 * @param B
 * @param pointInA
 * @returns
 */
function switchPointFromLocalToContainer(A: TMat2D, B: TMat2D, pointInA: Point) {
  console.log(pointInA.transform(A))
  const delta = util.multiplyTransformMatrices(B, A)
  // 将点A转换到B坐标系下
  const pInB = pointInA.transform(delta)
  return pInB
}

export default class CropPlugin implements IPlugin {
  #name: string = 'CropPlugin'
  public editor!: Editor
  constructor() {}
  get name() {
    return this.#name
  }

  init(editor: Editor) {
    this.editor = editor
    this.editor.emit('plugin:installed', this)
  }

  enterCrop() {
    // 创建一个点
    const point = document.createElement('div')
    const container = this.editor.stage.getElement().parentElement!.parentElement!.parentElement as HTMLDivElement
    point.style.width = '5px'
    point.style.height = '5px'
    point.style.backgroundColor = 'red'
    point.style.position = 'absolute'

    // 获取当前选中对象
    const obj = this.editor.stage.getActiveObject()
    if (!obj) return
    if (!obj.isType(ElementType.image)) return
    // 对象的变换矩阵
    const objMat = obj.calcTransformMatrix()
    const invertObjMat = util.invertTransform(objMat)
    // 画布的变换矩阵
    const viewMat = this.editor.stage.viewportTransform
    const invertViewMat = util.invertTransform(viewMat)

    const pointInCvs = switchPointFromLocalToContainer(objMat, viewMat, new Point(0, 0))
    point.style.left = pointInCvs.x + 'px'
    point.style.top = pointInCvs.y + 'px'

    container.appendChild(point)

    // 创建一个点
    // 将点限制在选中对象的范围内

    // 点的移动范围
    const left = 0 - obj.width / 2
    const right = obj.width / 2
    const top = -obj.height / 2
    const bottom = obj.height / 2
    console.log(left)
    let down = false
    point.addEventListener('mousedown', () => {
      down = true
      // 禁止point响应mousemove
      point.style.pointerEvents = 'none'
    })
    point.addEventListener('mousemove', (e) => {
      e.preventDefault()
    })

    //! 先用container,后期更换为 body?
    container.addEventListener('mousemove', (e) => {
      if (!down) return
      // 当前坐标转换为局部坐标，判断完再设置回来
      console.log(e)
      console.log(invertObjMat)
      const pointInContainer = new Point(e.offsetX, e.offsetY)
      // console.warn(e.offsetX, e.offsetY)
      const pointerInCvs = pointInContainer.transform(invertViewMat)
      const pointInLocal = pointerInCvs.transform(invertObjMat)
      // console.error(pointInLocal.x, pointInLocal.y)
      let toX = pointInLocal.x
      if (pointInLocal.x < left) toX = left
      if (pointInLocal.x > right) toX = right
      let toY = pointInLocal.y
      if (pointInLocal.y < top) toY = top
      if (pointInLocal.y > bottom) toY = bottom
      const moveInLocal = new Point(toX, toY)
      // 转换为container坐标
      const moveInCvs = moveInLocal.transform(objMat)
      const moveInContainer = moveInCvs.transform(viewMat)
      console.log(moveInContainer.x, moveInContainer.y)
      point.style.left = moveInContainer.x + 'px'
      point.style.top = moveInContainer.y + 'px'
    })
    container.addEventListener('mouseup', () => {
      down = false
      point.style.pointerEvents = ''
    })
  }
}
