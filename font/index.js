const fontkit = require('fontkit')
const fs = require('fs')
const path = require('path')

function writeContent(filePath, content, wrap = true) {
  fs.writeFileSync(filePath, `${content}${wrap ? '\n' : ''}`, { encoding: 'utf-8', flag: 'a' })
}

// 风格关键词
const styles = ['italic', 'oblique']
// 权重关键词, 顺序重要 extrabold 在bold之前
const weights = [
  'extrabold',
  'extralight',
  'semibold',
  'extrabold',
  'thin',
  'light',
  'regular',
  'medium',
  'bold',
  'black'
]
//(?:^|[^a-z])：确保前面不是字母（避免 superbold、highlight 等误匹配）
//(${...})：捕获具体权重
//(?=[^a-z]|$)：确保后面不是字母（防止 lightitalic 把 light 当匹配）
const weightRegex = new RegExp(`(?:^|[^a-z])(${weights.join('|')})(?=[^a-z]|$)`, 'i')
/** 从文件名提取权重和风格关键词 */
function extractFontInfo(filename) {
  const name = filename.toLowerCase()

  let weight = 'regular'
  for (const w of weights) {
    const regex = new RegExp(`\\b${w}\\b`, 'i') // \b 词边界
    if (regex.test(name)) {
      weight = w
      break
    }
  }

  let style = 'normal'
  if (/\bitalic\b/i.test(name)) style = 'italic'
  else if (/\boblique\b/i.test(name)) style = 'oblique'

  // 去除 weight 和 style
  let base = filename
  for (const keyword of [...weights, 'italic', 'oblique']) {
    base = base.replace(new RegExp(keyword, 'i'), '')
  }

  // 清除连接符、尾部残留
  const fontFamily = base
    .replace(/[-_]+$/, '')
    .replace(/[-_]+/g, '')
    .trim()

  return { fontFamily, weight, style }
}

function moveFileOverwrite(sourcePath, destDir) {
  const fileName = path.basename(sourcePath)
  const targetPath = path.join(destDir, fileName)

  // 确保目标目录存在
  // fs.mkdirSync(destDir, { recursive: true })

  // 复制并覆盖目标
  fs.copyFileSync(sourcePath, targetPath)

  // 删除原文件
  // fs.unlinkSync(sourcePath)

  console.log(`已移动并覆盖: ${targetPath}`)
}

const dir = path.join(__dirname, 'fontfiles')
const out = path.join(__dirname, 'out')
fs.rmSync(out, { recursive: true, force: true })
if (!fs.existsSync(out)) {
  fs.mkdirSync(out, { recursive: true })
}

const structure = {}
function readFontFile(dir) {
  const files = fs.readdirSync(dir)
  files.forEach((file, index) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isFile()) {
      const fkfont = fontkit.openSync(filePath)
      // 由于 fkfont.subfamilyName 和 familyName 不准确，因此由fullName 来拆分
      const { fullName } = fkfont
      const { fontFamily, weight, style } = extractFontInfo(fullName)
      console.log(fontFamily, weight, style)
      if (!Object.keys(structure).includes(fontFamily)) {
        structure[fontFamily] = {}
      }
      if (!structure[fontFamily][weight]) {
        structure[fontFamily][weight] = {}
      }
      structure[fontFamily][weight][style] = { fileName: file }
    } else if (stat.isDirectory()) {
      readFontFile(filePath)
    }
  })
}
readFontFile(dir)
console.log(structure)

const formatJson = JSON.stringify(structure, null, '\t')
const fontinfo = path.join(out, 'fontinfo.ts')
writeContent(fontinfo, 'export const fontInfo = ', false)
writeContent(fontinfo, formatJson)

const target = path.join(path.dirname(__dirname), 'fditor-ui', 'src', 'utils')
moveFileOverwrite(fontinfo, target)
