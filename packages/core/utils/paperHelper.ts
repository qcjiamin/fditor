import paperFull from 'paper/dist/paper-core'

export function roundPathCorners(pathStr: string, radius: number) {
  // 1. 初始化 Paper.js 画布（确保每次调用都是独立的，避免冲突）
  // 注意：如果是浏览器环境，也可以用 offscreenCanvas 或固定画布，这里用 Size 初始化更通用
  paperFull.setup(new paperFull.Size(1000, 1000))

  try {
    // 2. 创建原始路径（解析传入的 pathStr）
    const path = new paperFull.Path(pathStr)
    // 3. 克隆路径并添加圆角
    const roundedPath = path.clone()
    roundedPath.smooth({
      type: 'circular', // 圆弧型圆角（核心）
      radius: radius // 圆角半径，支持外部传入更灵活
    })

    // 4. 关键：将 Paper.js 路径对象转换为 SVG path 字符串
    // exportSVG() 会生成包含 path 标签的 SVG 片段，提取其中的 d 属性值
    const svgFragment = roundedPath.exportSVG({
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
