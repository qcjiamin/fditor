import { Point, TSimplePathData, util } from 'fabric'

/**
 * roundPathCorners 实现思路：
 *
 * 1. **解析路径 (Parse)**:
 *    将 SVG 路径数据解析为结构化的线段列表 (Segments)，统一处理直角 (L), 二阶贝塞尔 (Q), 三阶贝塞尔 (C)。
 *    并处理闭合路径 (Loop) 的首尾连接关系。
 *
 * 2. **计算切线与夹角 (Tangent & Angle)**:
 *    对每个顶点，计算“入切线” (TanIn) 和“出切线” (TanOut)。
 *    - 直线：向量方向。
 *    - 曲线：在端点处的导数 (Derivative)。
 *    计算两个切线的夹角 (Interior Angle)。
 *
 * 3. **计算裁剪长度 (Trim Length)**:
 *    基础公式：L = R / tan(θ/2)。
 *    - **迭代优化 (Iterative Refinement)**: 对于曲线连接，由于切断后新端点的切线会变化，采用迭代法 (4次) 逼近真实的裁剪长度，
 *      确保圆弧与被剪短后的曲线在连接点处完美相切 (G1连续)。
 *
 * 4. **限制与重算 (Clamping & Recalculation)**:
 *    如果计算出的裁剪长度超过线段长度的一半 (maxTrim)，则强制截断。
 *    **关键点**: 截断后，必须基于截断位置的切线重新计算圆角半径 (Effective R)，保证在该位置依然相切，避免图形畸变。
 *
 * 5. **生成 SVG (Generation)**:
 *    根据计算出的裁剪长度修剪线段 (Trim Segments)，并在连接处插入 SVG 圆弧命令 (A)。
 */

// 简单的 Vector 操作
const vec = {
  add: (v1: Point, v2: Point) => new Point(v1.x + v2.x, v1.y + v2.y),
  sub: (v1: Point, v2: Point) => new Point(v1.x - v2.x, v1.y - v2.y),
  mult: (v: Point, s: number) => new Point(v.x * s, v.y * s),
  len: (v: Point) => Math.hypot(v.x, v.y),
  norm: (v: Point) => {
    const l = Math.hypot(v.x, v.y)
    return l === 0 ? new Point(0, 0) : new Point(v.x / l, v.y / l)
  },
  dist: (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// ---------------------- Bezier Math ----------------------

// Helper: Calculate T for a given arc length from Start
function getTForLen(p0: Point, p1: Point, p2: Point, p3: Point, targetLen: number, totalLen?: number) {
  if (targetLen <= 0) return 0
  // Approximate total length if not provided
  if (totalLen === undefined) {
    totalLen = vec.dist(p0, p1) + vec.dist(p1, p2) + vec.dist(p2, p3) // rough
  }
  if (targetLen >= totalLen) return 1

  // Binary search for T
  let low = 0,
    high = 1
  let t = 0.5
  for (let i = 0; i < 20; i++) {
    t = (low + high) / 2
    // Calculate length at t
    // Efficient approx: split at t, sum chords of left part
    // For typical usage, flattening 3 times is enough precision?
    // Let's use simple chord sum of linearized cubic [0..t]
    const split = splitCubic(p0, p1, p2, p3, t)
    const left = split.left
    const l = vec.dist(left[0], left[1]) + vec.dist(left[1], left[2]) + vec.dist(left[2], left[3])
    // Chord sum is upper bound? No, usually longer than chord, shorter than control poly.
    // Control poly length is decent approx for monotonic curves.

    if (l < targetLen) low = t
    else high = t
  }
  return t
}

// Helper for Quad
function getTForLenQuad(p0: Point, p1: Point, p2: Point, targetLen: number) {
  let low = 0,
    high = 1
  let t = 0.5
  for (let i = 0; i < 20; i++) {
    t = (low + high) / 2
    const split = splitQuad(p0, p1, p2, t)
    const left = split.left
    const l = vec.dist(left[0], left[1]) + vec.dist(left[1], left[2]) // Control poly len

    if (l < targetLen) low = t
    else high = t
  }
  return t
}

// Split Cubic Bezier at t [0..1]
function splitCubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number) {
  const p01 = vec.add(vec.mult(p0, 1 - t), vec.mult(p1, t))
  const p12 = vec.add(vec.mult(p1, 1 - t), vec.mult(p2, t))
  const p23 = vec.add(vec.mult(p2, 1 - t), vec.mult(p3, t))
  const p012 = vec.add(vec.mult(p01, 1 - t), vec.mult(p12, t))
  const p123 = vec.add(vec.mult(p12, 1 - t), vec.mult(p23, t))
  const p0123 = vec.add(vec.mult(p012, 1 - t), vec.mult(p123, t))

  return {
    left: [p0, p01, p012, p0123],
    right: [p0123, p123, p23, p3]
  }
}

// Split Quadratic Bezier at t [0..1]
function splitQuad(p0: Point, p1: Point, p2: Point, t: number) {
  const p01 = vec.add(vec.mult(p0, 1 - t), vec.mult(p1, t))
  const p12 = vec.add(vec.mult(p1, 1 - t), vec.mult(p2, t))
  const p012 = vec.add(vec.mult(p01, 1 - t), vec.mult(p12, t))

  return {
    left: [p0, p01, p012],
    right: [p012, p12, p2]
  }
}

// Cubic Derivative at t
function getCubicDerivative(p0: Point, p1: Point, p2: Point, p3: Point, t: number) {
  const mt = 1 - t
  const a = vec.mult(vec.sub(p1, p0), 3 * mt * mt)
  const b = vec.mult(vec.sub(p2, p1), 6 * mt * t)
  const c = vec.mult(vec.sub(p3, p2), 3 * t * t)
  return vec.add(vec.add(a, b), c)
}

// Quad Derivative at t
function getQuadDerivative(p0: Point, p1: Point, p2: Point, t: number) {
  const mt = 1 - t
  const a = vec.mult(vec.sub(p1, p0), 2 * mt)
  const b = vec.mult(vec.sub(p2, p1), 2 * t)
  return vec.add(a, b)
}

// Trim End of Curve
function trimCubicEnd(p0: Point, p1: Point, p2: Point, p3: Point, dist: number) {
  // We want to KEEP length = Total - dist
  const totalApprox = vec.dist(p0, p1) + vec.dist(p1, p2) + vec.dist(p2, p3)
  const keepLen = Math.max(0, totalApprox - dist)

  const t = getTForLen(p0, p1, p2, p3, keepLen, totalApprox)

  const split = splitCubic(p0, p1, p2, p3, t)
  const seg = split.left
  return {
    cmd: ['C', seg[1].x, seg[1].y, seg[2].x, seg[2].y, seg[3].x, seg[3].y],
    endPoint: seg[3]
  }
}

// Trim Start of Curve
function trimCubicStart(p0: Point, p1: Point, p2: Point, p3: Point, dist: number) {
  const t = getTForLen(p0, p1, p2, p3, dist)

  const split = splitCubic(p0, p1, p2, p3, t)
  const seg = split.right
  return {
    cmd: ['C', seg[1].x, seg[1].y, seg[2].x, seg[2].y, seg[3].x, seg[3].y],
    startPoint: seg[0]
  }
}

function trimQuadEnd(p0: Point, p1: Point, p2: Point, dist: number) {
  const totalApprox = vec.dist(p0, p1) + vec.dist(p1, p2)
  const keepLen = Math.max(0, totalApprox - dist)
  const t = getTForLenQuad(p0, p1, p2, keepLen)

  const split = splitQuad(p0, p1, p2, t)
  const seg = split.left
  return {
    cmd: ['Q', seg[1].x, seg[1].y, seg[2].x, seg[2].y],
    endPoint: seg[2]
  }
}

function trimQuadStart(p0: Point, p1: Point, p2: Point, dist: number) {
  const t = getTForLenQuad(p0, p1, p2, dist)

  const split = splitQuad(p0, p1, p2, t)
  const seg = split.right
  return {
    cmd: ['Q', seg[1].x, seg[1].y, seg[2].x, seg[2].y],
    startPoint: seg[0]
  }
}

// Helper to get tangent at distance from Start (isEnd=false) or End (isEnd=true)
function getTangentAtDist(seg: any, dist: number, isEnd: boolean, totalLen: number) {
  if (seg.type === 'L') {
    return vec.sub(seg.end, seg.start)
  }

  if (isEnd) {
    // Trim from End -> Keep (Total - dist)
    const keepLen = Math.max(0, totalLen - dist)
    if (seg.type === 'Q') {
      const t = getTForLenQuad(seg.start, new Point(seg.data[1], seg.data[2]), seg.end, keepLen)
      return getQuadDerivative(seg.start, new Point(seg.data[1], seg.data[2]), seg.end, t)
    } else {
      const p0 = seg.start
      const p1 = new Point(seg.data[1], seg.data[2])
      const p2 = new Point(seg.data[3], seg.data[4])
      const p3 = seg.end
      const t = getTForLen(p0, p1, p2, p3, keepLen, totalLen)
      return getCubicDerivative(p0, p1, p2, p3, t)
    }
  } else {
    // Trim from Start -> T at dist
    if (seg.type === 'Q') {
      const t = getTForLenQuad(seg.start, new Point(seg.data[1], seg.data[2]), seg.end, dist)
      return getQuadDerivative(seg.start, new Point(seg.data[1], seg.data[2]), seg.end, t)
    } else {
      const p0 = seg.start
      const p1 = new Point(seg.data[1], seg.data[2])
      const p2 = new Point(seg.data[3], seg.data[4])
      const p3 = seg.end
      const t = getTForLen(p0, p1, p2, p3, dist, totalLen)
      return getCubicDerivative(p0, p1, p2, p3, t)
    }
  }
}

// ---------------------- Main Logic ----------------------

export function roundPathCorners(pathData: TSimplePathData, radius: number): string {
  if (radius <= 0) {
    return util.makePathSimpler(pathData).toString().replaceAll(',', ' ')
  }

  // 1. Structure segments
  const cmds = []
  let lastX = 0,
    lastY = 0
  let startX = 0,
    startY = 0

  for (const item of pathData) {
    const type = item[0]
    if (type === 'M') {
      lastX = item[1] as number
      lastY = item[2] as number
      startX = lastX
      startY = lastY
      cmds.push({ type: 'M', data: item, start: null, end: new Point(lastX, lastY) })
    } else if (type === 'L') {
      const x = item[1] as number
      const y = item[2] as number
      cmds.push({ type: 'L', data: item, start: new Point(lastX, lastY), end: new Point(x, y) })
      lastX = x
      lastY = y
    } else if (type === 'C') {
      const x = item[5] as number
      const y = item[6] as number
      cmds.push({ type: 'C', data: item, start: new Point(lastX, lastY), end: new Point(x, y) })
      lastX = x
      lastY = y
    } else if (type === 'Q') {
      const x = item[3] as number
      const y = item[4] as number
      cmds.push({ type: 'Q', data: item, start: new Point(lastX, lastY), end: new Point(x, y) })
      lastX = x
      lastY = y
    } else if (type === 'Z') {
      if (lastX !== startX || lastY !== startY) {
        cmds.push({
          type: 'L',
          data: ['L', startX, startY],
          start: new Point(lastX, lastY),
          end: new Point(startX, startY)
        })
      }
      cmds.push({ type: 'Z', data: item })
      lastX = startX
      lastY = startY
    }
  }

  const subPaths = []
  let currentSub: any[] = []
  for (const cmd of cmds) {
    if (cmd.type === 'M') {
      if (currentSub.length) subPaths.push(currentSub)
      currentSub = [cmd]
    } else {
      currentSub.push(cmd)
    }
  }
  if (currentSub.length) subPaths.push(currentSub)

  let finalSVG = ''

  const getLen = (cmd: any) => {
    if (cmd.type === 'L') return vec.dist(cmd.start, cmd.end)
    if (cmd.type === 'C') {
      const p0 = cmd.start
      const p1 = new Point(cmd.data[1], cmd.data[2])
      const p2 = new Point(cmd.data[3], cmd.data[4])
      const p3 = cmd.end
      return vec.dist(p0, p1) + vec.dist(p1, p2) + vec.dist(p2, p3)
    }
    if (cmd.type === 'Q') {
      const p0 = cmd.start
      const p1 = new Point(cmd.data[1], cmd.data[2])
      const p2 = cmd.end
      return vec.dist(p0, p1) + vec.dist(p1, p2)
    }
    return 0
  }

  for (const sub of subPaths) {
    const isClosed = sub[sub.length - 1].type === 'Z'
    const segs = sub.filter((c: any) => c.type !== 'M' && c.type !== 'Z')
    if (segs.length < 2) {
      sub.forEach((c: any) => {
        finalSVG += c.data.join(' ') + ' '
      })
      continue
    }

    const count = segs.length
    const isLoop = isClosed || (segs[count - 1].end.x === segs[0].start.x && segs[count - 1].end.y === segs[0].start.y)
    const vertexCount = isLoop ? count : count - 1
    const shift = isLoop ? 0 : 1

    const vertexTrims = []
    for (let k = 0; k < vertexCount; k++) {
      const idx = k + shift
      const prevIdx = (idx - 1 + count) % count
      const currIdx = idx % count

      const prevSeg = segs[prevIdx]
      const currSeg = segs[currIdx]

      let tanIn: Point
      if (prevSeg.type === 'L') {
        tanIn = vec.sub(prevSeg.end, prevSeg.start)
      } else if (prevSeg.type === 'Q') {
        tanIn = getQuadDerivative(prevSeg.start, new Point(prevSeg.data[1], prevSeg.data[2]), prevSeg.end, 1)
      } else {
        tanIn = getCubicDerivative(
          prevSeg.start,
          new Point(prevSeg.data[1], prevSeg.data[2]),
          new Point(prevSeg.data[3], prevSeg.data[4]),
          prevSeg.end,
          1
        )
      }

      let tanOut: Point
      if (currSeg.type === 'L') {
        tanOut = vec.sub(currSeg.end, currSeg.start)
      } else if (currSeg.type === 'Q') {
        tanOut = getQuadDerivative(currSeg.start, new Point(currSeg.data[1], currSeg.data[2]), currSeg.end, 0)
      } else {
        tanOut = getCubicDerivative(
          currSeg.start,
          new Point(currSeg.data[1], currSeg.data[2]),
          new Point(currSeg.data[3], currSeg.data[4]),
          currSeg.end,
          0
        )
      }

      const v_in_rev = vec.norm(vec.mult(tanIn, -1))
      const v_out = vec.norm(tanOut)

      const dot = v_in_rev.x * v_out.x + v_in_rev.y * v_out.y
      const interiorAngle = Math.acos(Math.max(-1, Math.min(1, dot)))

      if (Math.abs(interiorAngle - Math.PI) < 1e-4) {
        vertexTrims.push({
          r: 0,
          trimLen: 0,
          sweep: 0,
          prevIdx,
          currIdx,
          vertex: currSeg.start,
          idx
        })
        continue
      }

      // ---------------------------------------------------------
      // Iterative Refinement for Tangency
      // ---------------------------------------------------------
      let currentTrim = 0
      let angle = interiorAngle

      // We do a few iterations to converge
      for (let iter = 0; iter < 4; iter++) {
        if (Math.abs(angle - Math.PI) < 1e-4) {
          currentTrim = 0
          break
        }

        const neededTrim = radius / Math.tan(angle / 2)
        currentTrim = neededTrim

        if (currentTrim < 0.1) break

        // Measure tangents at this trim distance
        const prevTotal = getLen(prevSeg)
        const tInHat = getTangentAtDist(prevSeg, currentTrim, true, prevTotal)

        const currTotal = getLen(currSeg)
        const tOutHat = getTangentAtDist(currSeg, currentTrim, false, currTotal)

        // Recalculate Angle
        const v_in_new = vec.norm(vec.mult(tInHat, -1))
        const v_out_new = vec.norm(tOutHat)

        const dot_new = v_in_new.x * v_out_new.x + v_in_new.y * v_out_new.y
        angle = Math.acos(Math.max(-1, Math.min(1, dot_new)))
      }

      const trimLen = currentTrim

      // Calculate Sweep using original tangents (safe)
      const cross = tanIn.x * tanOut.y - tanIn.y * tanOut.x
      const sweep = cross > 0 ? 1 : 0

      // Max radius limiting
      const prevLen = getLen(prevSeg)
      const currLen = getLen(currSeg)

      // Calculate safe max trim (allowing for some margin? no, exact min is standard)
      // Standard for corner radius is usually stopping at midpoint to allow adjacent corners.
      const maxTrim = Math.min(prevLen / 2, currLen / 2)

      let effectiveTrim = trimLen
      let effectiveR = radius

      if (trimLen > maxTrim) {
        // WE MUST CLAMP
        effectiveTrim = maxTrim

        // RE-CALCULATE TANGENTS at this clamped trim distance using PRECISE method
        const prevTotal = getLen(prevSeg)
        const tInHat = getTangentAtDist(prevSeg, effectiveTrim, true, prevTotal)

        const currTotal = getLen(currSeg)
        const tOutHat = getTangentAtDist(currSeg, effectiveTrim, false, currTotal)

        const v_in_new = vec.norm(vec.mult(tInHat, -1))
        const v_out_new = vec.norm(tOutHat)

        const dot_new = v_in_new.x * v_out_new.x + v_in_new.y * v_out_new.y
        const newAngle = Math.acos(Math.max(-1, Math.min(1, dot_new)))

        // R = L * tan(angle/2)
        effectiveR = effectiveTrim * Math.tan(newAngle / 2)
      } else {
        // If trimLen is very small, R might be effectively 0
        if (trimLen <= 1e-6) effectiveR = 0
      }

      vertexTrims.push({
        r: effectiveR,
        trimLen: effectiveTrim,
        sweep,
        prevIdx,
        currIdx,
        vertex: currSeg.start,
        idx
      })
    } // End of For loop over Vertices

    // Now apply trims / generate new cmds
    const segInfos = new Array(count).fill(0).map(() => ({ trimStart: 0, trimEnd: 0 }))
    const joinArcs = new Array(count).fill(null)

    vertexTrims.forEach((vt) => {
      segInfos[vt.prevIdx].trimEnd = vt.trimLen || 0
      segInfos[vt.currIdx].trimStart = vt.trimLen || 0
      joinArcs[vt.prevIdx] = { r: vt.r, sweep: vt.sweep }
    })

    if (isLoop) {
    }

    const computedSegs = new Array(count)

    for (let i = 0; i < count; i++) {
      const info = segInfos[i]
      const seg = segs[i]
      const res = { cmd: seg.data, start: seg.start, end: seg.end }

      // 1. Trim Start
      if (info.trimStart > 0) {
        if (seg.type === 'L') {
          const v = vec.sub(seg.end, seg.start)
          const vnorm = vec.norm(v)
          res.start = vec.add(seg.start, vec.mult(vnorm, info.trimStart))
          res.cmd = ['L', res.end.x, res.end.y]
        } else if (seg.type === 'Q') {
          const p0 = seg.start
          const p1 = new Point(seg.data[1], seg.data[2])
          const p2 = seg.end
          const trimmed = trimQuadStart(p0, p1, p2, info.trimStart)
          res.start = trimmed.startPoint
          res.cmd = trimmed.cmd
        } else if (seg.type === 'C') {
          const p0 = seg.start
          const p1 = new Point(seg.data[1], seg.data[2])
          const p2 = new Point(seg.data[3], seg.data[4])
          const p3 = seg.end
          const trimmed = trimCubicStart(p0, p1, p2, p3, info.trimStart)
          res.start = trimmed.startPoint
          res.cmd = trimmed.cmd
        }
      }

      // 2. Trim End
      if (info.trimEnd > 0) {
        const start = res.start
        if (seg.type === 'L') {
          const v = vec.sub(res.end, start)
          const vnorm = vec.norm(v)
          res.end = vec.sub(res.end, vec.mult(vnorm, info.trimEnd))
          res.cmd = ['L', res.end.x, res.end.y]
        } else if (seg.type === 'Q') {
          const p0 = start
          const p1 = new Point(res.cmd[1], res.cmd[2])
          const p2 = new Point(res.cmd[3], res.cmd[4])
          const trimmed = trimQuadEnd(p0, p1, p2, info.trimEnd)
          res.end = trimmed.endPoint
          res.cmd = trimmed.cmd
        } else if (seg.type === 'C') {
          const p0 = start
          const p1 = new Point(res.cmd[1], res.cmd[2])
          const p2 = new Point(res.cmd[3], res.cmd[4])
          const p3 = new Point(res.cmd[5], res.cmd[6])
          const trimmed = trimCubicEnd(p0, p1, p2, p3, info.trimEnd)
          res.end = trimmed.endPoint
          res.cmd = trimmed.cmd
        }
      }

      computedSegs[i] = res
    }

    if (isLoop) {
      const p = computedSegs[0].start
      finalSVG += `M ${p.x} ${p.y} `
    } else {
      const p = computedSegs[0].start
      finalSVG += `M ${p.x} ${p.y} `
    }

    for (let i = 0; i < count; i++) {
      const seg = computedSegs[i]
      finalSVG += `${seg.cmd.join(' ')} `

      if (!isLoop && i === count - 1) break

      const nextIdx = (i + 1) % count
      const nextSeg = computedSegs[nextIdx]
      const arc = joinArcs[i]

      if (arc && arc.r > 0 && vec.dist(seg.end, nextSeg.start) > 0.01) {
        finalSVG += `A ${arc.r} ${arc.r} 0 0 ${arc.sweep} ${nextSeg.start.x} ${nextSeg.start.y} `
      } else if (vec.dist(seg.end, nextSeg.start) > 0.01) {
        finalSVG += `L ${nextSeg.start.x} ${nextSeg.start.y} `
      }
    }

    if (isClosed) {
      finalSVG += 'Z '
    }
  }

  return finalSVG.trim()
}
