import { Point } from 'fabric'
import BasePen from './basePen'
import { BaseSubPen } from './baseSubPen'
import { subPenType } from '@fditor/core'
import { penPoint } from './type'
import { computeProjectionsSafe, mirrorPointByMidPerpendicular } from '../../utils/common'

export default class SubCurve extends BaseSubPen {
  type: subPenType = 'curve'
  dragPoint: penPoint | null = null
  clickAnchor: penPoint | null = null

  // 记录当前操作的手柄相关的锚点（用于对称计算等）
  // activeAnchor: penPoint | null = null

  onMouseDown(pen: BasePen, point: Point): void {
    // 1. 优先检测手柄点击 (需要 BasePen 或 SubCurve 维护渲染出的临时手柄列表?
    //    由于 handleIn/handleOut 存储在 segment 中，我们可以遍历 helper 找?)
    //    简化：每次 render 时收集可见手柄位置用于 hitTest
    //    或者：直接遍历所有 segments 的 handleIn/handleOut

    // const clickedHandle = this._getClickedHandle(pen, point)
    const clickedHandle = this.pen.isOverHandlePoint(point)
    if (clickedHandle) {
      this.dragPoint = clickedHandle
      this._render(pen)
      return
    }

    // pen.clearSelcted()
    // // 2. 检测锚点点击
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      this.clickAnchor = hoverPenPoint
    }
    // this._render(pen)
  }

  onMouseMove(pen: BasePen, point: Point): void {
    if (this.dragPoint) {
      this.dragPoint.x = point.x
      this.dragPoint.y = point.y

      // 更新 segment 类型为 cubic (如果还不是)
      // if (this.dragPoint.ownerSegmentId) {
      //   const seg = pen.segments.find((s) => s.id === this.dragPoint?.ownerSegmentId)
      //   if (seg && seg.type === 'line') {
      //     seg.type = 'cubic'
      //   }
      // }

      this._render(pen)
      return
    }

    // Hover Logic
    pen.clearHover()
    const hoverPenPoint = pen.isOverPoint(point)
    if (hoverPenPoint) {
      hoverPenPoint.hover = true
    }
    this._render(pen)
  }

  onMouseUp(pen: BasePen, point: Point): void {
    // 点击空白处，清空选中
    if (!this.dragPoint && !this.clickAnchor) {
      pen.clearSelcted()
    }

    this.dragPoint = null
    const hoverPenPoint = pen.isOverPoint(point)
    // 确定点击发生
    if (hoverPenPoint && this.clickAnchor && hoverPenPoint.id === this.clickAnchor.id) {
      // 如果被点击的点本身处于选中状态，将其选中状态清空，并且移除该点关联线段的handle. 即取消该点的曲线效果
      if (hoverPenPoint.selected) {
        const fromSegs = this.pen.segments.filter((s) => s.from === hoverPenPoint.id)
        const toSegs = this.pen.segments.filter((s) => s.to === hoverPenPoint.id)
        fromSegs.forEach((s) => {
          delete s.handleOut
        })
        toSegs.forEach((s) => {
          delete s.handleIn
        })
        hoverPenPoint.selected = false
        this._render(pen)
        return
      } else {
        // 点在被点击时不是选中状态，清空其他选中，设置选中该点，然后初始化handle点，渲染
        pen.clearSelcted()
        hoverPenPoint.selected = true
        this._initHandlesForAnchor(pen, hoverPenPoint)
        this._render(pen)
      }
    }
    this.clickAnchor = null
  }

  enter(pen: BasePen): void {
    super.enter(pen)
    this._render(pen)
  }
  /** 点击到anchor点时，初始化其控制点 */
  _initHandlesForAnchor(pen: BasePen, anchor: penPoint) {
    // 1. Find segment where anchor is FROM (Segment A) -> A.handleOut
    // const segOut = pen.segments.find(s => s.from === anchor.id)
    const segOuts = this.pen.segments.filter((s) => s.from === anchor.id)
    const segIns = this.pen.segments.filter((s) => s.to === anchor.id)
    // 点只对应2条边
    const isAngle = segOuts.length + segIns.length === 2
    if (isAngle) {
      const segs = [...segOuts, ...segIns]
      const segA = segs[0]
      const segB = segs[1]
      let pointA = null
      let pointB = null
      if (segA.from === anchor.id) {
        pointA = segA.to
      } else {
        pointA = segA.from
      }
      if (segB.from === anchor.id) {
        pointB = segB.to
      } else {
        pointB = segB.from
      }
      const A = this.pen.points.find((p) => p.id === pointA)
      const B = this.pen.points.find((p) => p.id === pointB)
      if (!A || !B) {
        throw new Error('Invalid point')
      }
      const { handleA, handleB } = computeProjectionsSafe(A, anchor, B)
      // 将控制点添加到points中
      const handlePointA: penPoint = {
        id: window.crypto.randomUUID() as string,
        type: 'move', // 借用 move 状态? 还是 'line'? penPoint type 定义是 penState
        x: handleA.x,
        y: handleA.y,
        hover: false,
        selected: false,
        role: 'handle',
        ownerSegmentId: segA.id
      }
      this.pen.points.push(handlePointA)
      const handlePointB: penPoint = {
        id: window.crypto.randomUUID() as string,
        type: 'move', // 借用 move 状态? 还是 'line'? penPoint type 定义是 penState
        x: handleB.x,
        y: handleB.y,
        hover: false,
        selected: false,
        role: 'handle',
        ownerSegmentId: segB.id
      }
      this.pen.points.push(handlePointB)

      if (segA.from === anchor.id) {
        segA.handleOut = handlePointA.id
      } else {
        segA.handleIn = handlePointA.id
      }
      if (segB.from === anchor.id) {
        segB.handleOut = handlePointB.id
      } else {
        segB.handleIn = handlePointB.id
      }

      return
    }

    if (segOuts.length > 0) {
      let posX: number
      let posY: number
      for (const segOut of segOuts) {
        if (!segOut.handleOut) {
          if (segOut.handleIn) {
            // 有输入控制点， 将输出控制点与输入控制点对称
            const handleInPoint = this.pen.points.find((p) => p.id === segOut.handleIn)
            if (!handleInPoint) throw new Error('Invalid point')
            const fromPoint = this.pen.points.find((p) => p.id === segOut.from)
            const toPoint = this.pen.points.find((p) => p.id === segOut.to)
            if (!fromPoint || !toPoint) throw new Error('Invalid point')

            const mirrored = mirrorPointByMidPerpendicular(fromPoint, toPoint, handleInPoint)
            posX = mirrored.x
            posY = mirrored.y
          } else {
            // 无输入控制点， 1/3 distance to A.to
            const toPoint = this.pen.points.find((p) => p.id === segOut.to)
            if (!toPoint) throw new Error('Invalid point')
            const vX = toPoint.x - anchor.x
            const vY = toPoint.y - anchor.y
            posX = anchor.x + vX / 3
            posY = anchor.y + vY / 3
          }
          const handlePoint: penPoint = {
            id: window.crypto.randomUUID() as string,
            type: 'move', // 借用 move 状态? 还是 'line'? penPoint type 定义是 penState
            x: posX,
            y: posY,
            hover: false,
            selected: false,
            role: 'handle',
            ownerSegmentId: segOut.id
          }
          this.pen.points.push(handlePoint)
          segOut.handleOut = handlePoint.id
        }
      }
    }

    //2. 找到所有将点击的点作为终点的线段
    if (segIns.length > 0) {
      let posX: number
      let posY: number
      for (const segIn of segIns) {
        // 终点对应输入控制点，如果没有，要按照 输出 控制点来创建
        if (!segIn.handleIn) {
          if (segIn.handleOut) {
            // 有输出控制点， 将输入控制点与输出控制点对称
            const handleOutPoint = this.pen.points.find((p) => p.id === segIn.handleOut)
            if (!handleOutPoint) throw new Error('Invalid point')
            const fromPoint = this.pen.points.find((p) => p.id === segIn.from)
            const toPoint = this.pen.points.find((p) => p.id === segIn.to)
            if (!fromPoint || !toPoint) throw new Error('Invalid point')

            const mirrored = mirrorPointByMidPerpendicular(fromPoint, toPoint, handleOutPoint)
            posX = mirrored.x
            posY = mirrored.y
          } else {
            // 无输出控制点， 1/3 distance to B.from
            const fromPoint = this.pen.points.find((p) => p.id === segIn.from)
            if (!fromPoint) throw new Error('Invalid point')
            const vX = fromPoint.x - anchor.x
            const vY = fromPoint.y - anchor.y
            posX = anchor.x + vX / 3
            posY = anchor.y + vY / 3
          }
          const handlePoint: penPoint = {
            id: window.crypto.randomUUID() as string,
            type: 'move',
            x: posX,
            y: posY,
            hover: false,
            selected: false,
            role: 'handle',
            ownerSegmentId: segIn.id
          }
          this.pen.points.push(handlePoint)
          segIn.handleIn = handlePoint.id
        }
      }
    }
  }

  _render(pen: BasePen): void {
    // 1. Draw Path (Standard + Curve)
    const ctx = pen.canvas.contextTop
    pen.canvas.clearContext(ctx)
    pen._saveAndTransform(ctx)

    // Fill
    if (pen.fill) {
      // SubSelect's logic for fill ?? Reuse or Copy?
      // Let's implement stroke logic primarily first as requested
    }

    ctx.strokeStyle = pen.color
    ctx.lineWidth = pen.width
    ctx.lineCap = pen.strokeLineCap
    ctx.lineJoin = pen.strokeLineJoin

    ctx.beginPath()
    let lastPointId = ''

    for (let i = 0; i < pen.segments.length; i++) {
      const seg = pen.segments[i]
      const { from, to } = seg
      const fromPoint = pen.points.find((p) => p.id === from)
      const toPoint = pen.points.find((p) => p.id === to)
      if (!fromPoint || !toPoint) continue

      if (lastPointId !== fromPoint.id) {
        ctx.moveTo(fromPoint.x, fromPoint.y)
      }

      // 如果有handleIn 或则 handleOut, 画贝塞尔曲线；否则画直线
      if ((seg.handleIn && !seg.handleOut) || (seg.handleOut && !seg.handleIn)) {
        let h = null
        if (seg.handleIn) {
          h = this.pen.points.find((p) => p.id === seg.handleIn)
        } else if (seg.handleOut) {
          h = this.pen.points.find((p) => p.id === seg.handleOut)
        }
        if (!h) throw new Error('Invalid point')
        ctx.quadraticCurveTo(h.x, h.y, toPoint.x, toPoint.y)
      } else if (seg.handleIn && seg.handleOut) {
        const h1 = this.pen.points.find((p) => p.id === seg.handleOut)
        const h2 = this.pen.points.find((p) => p.id === seg.handleIn)
        if (!h1 || !h2) throw new Error('Invalid point')
        ctx.bezierCurveTo(h1.x, h1.y, h2.x, h2.y, toPoint.x, toPoint.y)
      } else {
        ctx.lineTo(toPoint.x, toPoint.y)
      }
      lastPointId = toPoint.id
    }
    ctx.stroke()

    // 2. Draw Handles & Lines (Only for selected anchor)
    const selectedAnchor = pen.points.find((p) => p.selected && p.role === 'anchor')
    if (selectedAnchor) {
      ctx.lineWidth = 2
      ctx.strokeStyle = 'red' // 辅助线颜色
      ctx.beginPath()

      // 找关联 Handle
      const handles: penPoint[] = []
      pen.segments.forEach((seg) => {
        if (seg.from === selectedAnchor.id && seg.handleOut) {
          const handleOutPoint = pen.points.find((p) => p.id === seg.handleOut)
          if (!handleOutPoint) throw new Error('Invalid point')
          handles.push(handleOutPoint)
          ctx.moveTo(selectedAnchor.x, selectedAnchor.y)
          ctx.lineTo(handleOutPoint.x, handleOutPoint.y)
        }
        if (seg.to === selectedAnchor.id && seg.handleIn) {
          const handleInPoint = pen.points.find((p) => p.id === seg.handleIn)
          if (!handleInPoint) throw new Error('Invalid point')
          handles.push(handleInPoint)
          ctx.moveTo(selectedAnchor.x, selectedAnchor.y)
          ctx.lineTo(handleInPoint.x, handleInPoint.y)
        }
      })
      ctx.stroke()

      // Draw Handle Points
      handles.forEach((h) => {
        ctx.beginPath()
        ctx.arc(h.x, h.y, 6, 0, Math.PI * 2) // 小一点的圆
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#000'
        ctx.fill()
        ctx.stroke()
      })
    }

    // 3. Draw Anchors (Reuse SubSelect Logic or simplified)
    pen.points
      .filter((p) => p.role === 'anchor')
      .forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, pen.pointRadius, 0, Math.PI * 2)
        ctx.fillStyle = p.selected ? pen.pointSelectFill : pen.pointFill
        ctx.strokeStyle = p.selected ? pen.pointSelectStroke : pen.pointStroke
        ctx.fill()
        ctx.stroke()
      })

    ctx.restore()
  }
}
