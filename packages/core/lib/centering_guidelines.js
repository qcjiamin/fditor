import { Point } from 'fabric'

/**
 * Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
 * This kind of sucks because other code using those methods will stop functioning.
 * Need to fix it by replacing callbacks with pub/sub kind of subscription model.
 * (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
 */
export function initCenteringGuidelines(canvas) {
  //? 将变量提升，监听画布resize重新花去
  var canvasWidth, canvasHeight
  var canvasWidthCenter,
    canvasHeightCenter,
    canvasWidthCenterMap = {},
    canvasHeightCenterMap = {},
    canvasTopMap = {},
    canvasBottomMap = {},
    canvasLeftMap = {},
    canvasRightMap = {},
    // 判断范围，也是吸附范围
    centerLineMargin = 15,
    centerLineColor = 'rgba(255,0,241,0.5)',
    centerLineWidth = 2,
    ctx = canvas.getSelectionContext(),
    viewportTransform

  function initData() {
    if (canvas.clipPath) {
      canvasWidth = canvas.clipPath.width
      canvasHeight = canvas.clipPath.height
    } else {
      canvasWidth = canvas.getWidth() / canvas.getZoom()
      canvasHeight = canvas.getHeight() / canvas.getZoom()
    }
    canvasWidthCenter = canvasWidth / 2
    canvasHeightCenter = canvasHeight / 2
    // 清空上次的数据
    canvasWidthCenterMap = {}
    canvasHeightCenterMap = {}
    canvasTopMap = {}
    canvasBottomMap = {}
    canvasLeftMap = {}
    canvasRightMap = {}

    for (var i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
      canvasWidthCenterMap[Math.round(i)] = true
    }
    for (var i = canvasHeightCenter - centerLineMargin, len = canvasHeightCenter + centerLineMargin; i <= len; i++) {
      canvasHeightCenterMap[Math.round(i)] = true
    }

    for (var i = 0 - centerLineMargin, len = 0 + centerLineMargin; i <= len; i++) {
      canvasTopMap[Math.round(i)] = true
    }
    for (var i = canvasHeight - centerLineMargin, len = canvasHeight + centerLineMargin; i <= len; i++) {
      canvasBottomMap[Math.round(i)] = true
    }
    for (var i = 0 - centerLineMargin, len = 0 + centerLineMargin; i <= len; i++) {
      canvasLeftMap[Math.round(i)] = true
    }
    for (var i = canvasWidth - centerLineMargin, len = canvasWidth + centerLineMargin; i <= len; i++) {
      canvasRightMap[Math.round(i)] = true
    }
  }
  initData()
  canvas.on('canvas:resize', () => {
    initData()
  })

  const offset = centerLineWidth / 2
  function showVerticalCenterLine() {
    showCenterLine(0, canvasHeightCenter + offset, canvasWidth, canvasHeightCenter + offset)
  }

  function showHorizontalCenterLine() {
    showCenterLine(canvasWidthCenter + offset, 0, canvasWidthCenter + offset, canvasHeight)
  }
  function showTopLine() {
    showCenterLine(0, offset + offset, canvasWidth, offset + offset)
  }
  function showBottomLine() {
    showCenterLine(0, canvasHeight - offset, canvasWidth, canvasHeight - offset)
  }
  function showLeftLine() {
    showCenterLine(offset, 0, offset, canvasHeight)
  }
  function showRightLine() {
    showCenterLine(canvasWidth - offset, 0, canvasWidth - offset, canvasHeight)
  }

  function showCenterLine(x1, y1, x2, y2) {
    //? 保证线的宽度不受缩放影响
    ctx.save()
    ctx.transform(1, 0, 0, 1, viewportTransform[4], viewportTransform[5])
    ctx.strokeStyle = centerLineColor
    ctx.lineWidth = centerLineWidth
    ctx.beginPath()
    ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3])
    ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3])
    ctx.stroke()
    ctx.restore()
  }

  var afterRenderActions = [],
    isInVerticalCenter,
    isInHorizontalCenter,
    isInTop,
    isInBottom,
    isInLeft,
    isInRight

  canvas.on('mouse:down', () => {
    viewportTransform = canvas.viewportTransform
  })

  canvas.on('object:moving', function (e) {
    var object = e.target,
      objectCenter = object.getCenterPoint(),
      transform = canvas._currentTransform
    const topLeftPoint = object.getPointByOrigin('left', 'top')
    const bottomRightPoint = object.getPointByOrigin('right', 'bottom')

    if (!transform) return
    isInHorizontalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap
    isInVerticalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap

    isInTop = Math.round(topLeftPoint.y) in canvasTopMap
    isInBottom = Math.round(bottomRightPoint.y) in canvasBottomMap
    isInLeft = Math.round(topLeftPoint.x) in canvasLeftMap
    isInRight = Math.round(bottomRightPoint.x) in canvasRightMap

    if (isInHorizontalCenter || isInVerticalCenter) {
      console.log('vh', isInHorizontalCenter, isInVerticalCenter)
      object.setPositionByOrigin(
        new Point(
          isInHorizontalCenter ? canvasWidthCenter : objectCenter.x,
          isInVerticalCenter ? canvasHeightCenter : objectCenter.y
        ),
        'center',
        'center'
      )
    }
    if (isInTop) {
      object.setPositionByOrigin(new Point(object.left, 0), 'left', 'top')
    }
    if (isInBottom) {
      object.setPositionByOrigin(new Point(object.left, canvasHeight - object.getScaledHeight()), 'left', 'top')
    }
    if (isInLeft) {
      object.setPositionByOrigin(new Point(0, object.top), 'left', 'top')
    }
    if (isInRight) {
      object.setPositionByOrigin(new Point(canvasWidth - object.getScaledWidth(), object.top), 'left', 'top')
    }
  })

  canvas.on('before:render', () => {
    if (canvas.contextTop) {
      canvas.clearContext(canvas.contextTop)
    }
  })

  canvas.on('after:render', () => {
    if (isInVerticalCenter) {
      showVerticalCenterLine()
    }
    if (isInHorizontalCenter) {
      showHorizontalCenterLine()
    }
    if (isInTop) {
      showTopLine()
    }
    if (isInBottom) {
      showBottomLine()
    }
    if (isInLeft) {
      showLeftLine()
    }
    if (isInRight) {
      showRightLine()
    }
  })

  canvas.on('mouse:up', () => {
    // clear these values, to stop drawing guidelines once mouse is up
    isInVerticalCenter = isInHorizontalCenter = isInTop = isInBottom = isInLeft = isInRight = null
    canvas.renderAll()
  })
}
