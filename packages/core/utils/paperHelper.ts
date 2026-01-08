import paperFull from 'paper/dist/paper-core'
import { PaperRoundCorners } from 'paperjs-round-corners'
function roundPath(path: paper.Path, radius: number, eps = 1e-6): paper.Path {
  if (radius <= 0) return path.clone()

  const src = path.clone()
  src.remove()

  const dst = new paperFull.Path({
    closed: path.closed,
    insert: false
  })

  const segs = src.segments
  const count = segs.length

  function isStraight(seg: paper.Segment) {
    return seg.handleIn.isZero() && seg.handleOut.isZero()
  }

  function cross(a: paper.Point, b: paper.Point) {
    return a.x * b.y - a.y * b.x
  }

  for (let i = 0; i < count; i++) {
    const curr = segs[i]
    const prev = segs[(i - 1 + count) % count]
    const next = segs[(i + 1) % count]

    // 非闭合 path 的端点直接保留
    if (!path.closed && (i === 0 || i === count - 1)) {
      dst.add(curr.point)
      continue
    }

    // 只处理直线拐角
    if (!isStraight(prev) || !isStraight(curr) || !isStraight(next)) {
      dst.add(curr.point)
      continue
    }

    const v1 = prev.point.subtract(curr.point)
    const v2 = next.point.subtract(curr.point)

    const len1 = v1.length
    const len2 = v2.length

    if (len1 < eps || len2 < eps) {
      dst.add(curr.point)
      continue
    }

    const d1 = v1.normalize()
    const d2 = v2.normalize()

    // 共线直接跳过
    if (Math.abs(cross(d1, d2)) < eps) {
      dst.add(curr.point)
      continue
    }

    // 半径 clamp（不能超过边长一半）
    const r = Math.min(radius, len1 / 2, len2 / 2)

    // 圆弧 Bezier 控制系数
    // 夹角 alpha
    const alpha = Math.acos(Math.max(-1, Math.min(1, d1.dot(d2))))
    // 圆心角 theta = PI - alpha
    const theta = Math.PI - alpha

    const k = (4 / 3) * Math.tan(theta / 4)
    const handleLen = r * k

    // Handles point TOWARDS the corner (C)
    // p1 = C - d1*r. handleOut points to C => direction -d1
    // p2 = C - d2*r. handleIn points to C => direction -d2 (Control is 'in' from anchor)

    // Calculate arc start/end points
    const p1 = curr.point.add(d1.multiply(r))
    const p2 = curr.point.add(d2.multiply(r))

    // Note: d1 is vector FROM Corner TO Prev?
    // Wait, let's re-verify d1 definition in current code scope.
    // v1 = prev - curr. (Prev - Corner).
    // d1 = v1.normalize(). So d1 points AWAY from Corner.
    // So p1 = curr + d1*r. Correct logic up there.
    // Vector p1 -> C is -d1.
    // Vector p2 -> C is -d2.

    const seg1 = new paperFull.Segment(
      p1,
      null,
      d1.multiply(-handleLen) // handleOut towards corner
    )

    const seg2 = new paperFull.Segment(
      p2,
      d2.multiply(-handleLen), // handleIn towards corner
      null
    )

    dst.add(seg1)
    dst.add(seg2)
  }

  dst.closed = path.closed
  // dst.insertAbove(path);

  return dst
}

export function roundPathWithCurves(path: paper.Path, radius: number, flatness = 0.5): paper.Path {
  if (radius <= 0) return path.clone()

  // 1️⃣ clone，避免污染原 path
  const src = path.clone()
  // 临时 path 不需要显示
  src.visible = false

  // 2️⃣ flatten 曲线（关键）
  src.flatten(flatness)

  // 3️⃣ 对“已线性化”的 path 做圆角
  const rounded = roundPath(src, radius)

  // 复制样式
  rounded.style = path.style

  // 清理临时 path
  src.remove()

  return rounded
}

export function roundPathCorners(pathStr: string, radius: number) {
  // 1. 初始化 Paper.js 画布（确保每次调用都是独立的，避免冲突）
  // 注意：如果是浏览器环境，也可以用 offscreenCanvas 或固定画布，这里用 Size 初始化更通用
  paperFull.setup(new paperFull.Size(1000, 1000))

  try {
    // 2. 创建原始路径（解析传入的 pathStr）
    const path = new paperFull.Path(pathStr)

    // const roundness = 20 // Adjust the roundness value as needed
    const options = { method: 'cubic' } // Choose the desired rounding method

    // Round a single segment
    // PaperRoundCorners.round(path.segments[0], roundness, options);

    // Round multiple segments
    PaperRoundCorners.roundMany(path.segments, radius, options)

    // const roundedPath = roundPathWithCurves(path, radius)

    // 3. 克隆路径并添加圆角
    // const roundedPath = path.clone()
    // roundedPath.smooth({
    //   // type: 'circular', // 圆弧型圆角（核心）
    //   // radius: radius // 圆角半径，支持外部传入更灵活
    //   type: 'continuous'
    // })

    // 4. 关键：将 Paper.js 路径对象转换为 SVG path 字符串
    // exportSVG() 会生成包含 path 标签的 SVG 片段，提取其中的 d 属性值
    const svgFragment = path.exportSVG({
      precision: 2, // 控制坐标精度，避免过多小数，可选
      asString: false // 返回 SVGElement 对象，方便提取 d 属性
    })
    const roundedPathStr = svgFragment.getAttribute('d')
    console.log(roundedPathStr)
    // 5. 清理 Paper.js 内部状态（避免内存泄漏）
    paperFull.project.clear()
    paperFull.view.remove()

    // 6. 返回处理后的路径字符串
    return roundedPathStr
  } catch (error) {
    console.error('路径圆角处理失败：', error)
    // 失败时返回原始路径，保证函数鲁棒性
  }
}
