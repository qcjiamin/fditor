const fontkit = require('fontkit')
const fs = require('fs')
const path = require('path')

function writeContent(filePath, content, wrap = true) {
  fs.writeFileSync(filePath, `${content}${wrap ? '\n' : ''}`, { encoding: 'utf-8', flag: 'a' })
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
      const splits = fullName.split(' ')
      if (splits.length <= 1) throw new Error(`${fullName} err`)
      const subfamilyName = splits[splits.length - 1].toLowerCase()
      splits.length = splits.length - 1
      const familyName = splits.join(' ')
      if (!Object.keys(structure).includes(familyName)) {
        structure[familyName] = {}
      }
      structure[familyName][subfamilyName] = { fileName: file }
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
