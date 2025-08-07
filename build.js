import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { configDotenv } from 'dotenv'

// 加载 .env 环境变量
configDotenv()

// 日志函数（保持不变）
const log = (message, type = 'info') => {
  const prefixes = {
    info: '\x1b[34m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m'
  }
  console.log(`${prefixes[type]} ${message}`)
}

// 执行命令（支持指定工作目录）
const runCommand = (command, cwd = process.cwd()) => {
  try {
    log(`执行命令: ${command} (在 ${cwd})`)
    execSync(command, { cwd, stdio: 'inherit' })
    return true
  } catch (error) {
    log(`命令执行失败: ${command}`, 'error')
    log(`错误信息: ${error.message}`, 'error')
    process.exit(1)
  }
}

// 检查必要文件（适配monorepo结构）
const checkRequiredFiles = () => {
  const requiredFiles = [
    'package.json', // 根目录package.json
    'yarn.lock',
    'Dockerfile',
    'nginx.conf',
    'fditor-ui/package.json', // 子项目package.json
    'fditor-ui/vite.config.ts' // 确保前端项目配置存在
  ]

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) {
      log(`缺少必要文件: ${file}`, 'error')
      process.exit(1)
    }
  }
  log('所有必要文件检查通过')
}

// 自增版本号（修改fditor-ui的版本，而非根目录）
const incrementVersion = () => {
  const uiPackagePath = path.join(process.cwd(), 'fditor-ui', 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(uiPackagePath, 'utf8'))
  const currentVersion = packageJson.version || '1.0.0'

  const [major, minor, patch] = currentVersion.split('.').map(Number)
  const newVersion = `${major}.${minor}.${patch + 1}`

  packageJson.version = newVersion
  fs.writeFileSync(uiPackagePath, JSON.stringify(packageJson, null, 2) + '\n')

  log(`fditor-ui版本已从 ${currentVersion} 更新为 ${newVersion}`)
  return newVersion
}

// 检查Docker Hub认证状态
const checkDockerLogin = () => {
  try {
    // 检查是否已登录Docker Hub
    execSync('docker info --format "{{.RegistryConfig.IndexConfigs.docker.io.Name}}"', { stdio: 'pipe' })
    return true
  } catch (error) {
    return false
  }
}

// Docker Hub登录
const dockerLogin = (username, password) => {
  if (!username || !password) {
    log('Docker Hub用户名或密码未提供', 'error')
    process.exit(1)
  }

  try {
    log('登录Docker Hub...')
    // 使用环境变量传递敏感信息，避免命令行历史泄露
    execSync(`echo "${password}" | docker login -u ${username} --password-stdin`, { stdio: 'inherit' })
    log('Docker Hub登录成功')
  } catch (error) {
    log('Docker Hub登录失败', 'error')
    process.exit(1)
  }
}

// 推送镜像到Docker Hub
const pushToDockerHub = (imageTag, dockerHubUsername, imageName) => {
  const fullImageTag = `${dockerHubUsername}/${imageTag}`

  try {
    // 为镜像添加Docker Hub仓库标签
    runCommand(`docker tag ${imageTag} ${fullImageTag}`)

    // 推送镜像
    log(`推送镜像到Docker Hub: ${fullImageTag}`)
    runCommand(`docker push ${fullImageTag}`)

    // 推送latest标签
    const latestTag = `${dockerHubUsername}/${imageName}:latest`
    runCommand(`docker tag ${imageTag} ${latestTag}`)
    runCommand(`docker push ${latestTag}`)

    log('镜像推送成功', 'success')
  } catch (error) {
    log('镜像推送失败', 'error')
    process.exit(1)
  }
}

// 检查Git工作区是否干净
const checkGitClean = () => {
  try {
    // 检查是否有未提交的更改
    execSync('git diff --quiet', { stdio: 'pipe' })
    execSync('git diff --cached --quiet', { stdio: 'pipe' })
  } catch (error) {
    log(`git工作区有待提交文件`, 'error')
    process.exit(1)
  }
}

// Git提交版本变更并打标签
const gitCommitAndTag = (newVersion) => {
  try {
    // 添加版本文件变更
    // runCommand('git add fditor-ui/package.json')
    runCommand('git add .')

    // 提交变更
    const commitMessage = `chore(release): bump version to ${newVersion}`
    runCommand(`git commit -m "${commitMessage}"`)

    // 创建标签
    const tagName = `v${newVersion}` // 标签格式如 v1.0.1
    runCommand(`git tag -a ${tagName} -m "Release version ${newVersion}"`)

    // 推送提交和标签到远程仓库
    runCommand('git push origin HEAD')
    runCommand(`git push origin ${tagName}`)

    log(`已提交版本变更并创建标签: ${tagName}`, 'success')
  } catch (error) {
    log('Git提交或标签操作失败', 'error')
    process.exit(1)
  }
}

// 主构建流程
const main = () => {
  try {
    log('开始monorepo项目构建流程...')
    // 获取Docker Hub配置（从环境变量读取敏感信息）
    const dockerHubUsername = process.env.DOCKER_HUB_USERNAME
    const dockerHubPassword = process.env.DOCKER_HUB_PASSWORD
    const imageName = 'fditor-ui' // 镜像名称

    // 1. 检查必要文件
    checkRequiredFiles()
    // 1.1 检查是否有未提交的修改文件
    checkGitClean()

    // 2. 清理fditor-ui的旧构建产物
    const distPath = path.join(process.cwd(), 'fditor-ui', 'dist')
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true })
      log('已清理fditor-ui旧构建产物')
    }

    // 3. 自增fditor-ui版本号
    const newVersion = incrementVersion()

    // 4. 根目录安装所有依赖（包括workspaces）
    log('安装根目录依赖（包括workspaces）')
    runCommand('yarn install --frozen-lockfile')

    // 5. 构建fditor-ui（进入子项目目录）
    log('开始构建fditor-ui')
    runCommand('yarn run build', path.join(process.cwd(), 'fditor-ui'))

    // 6. 检查构建产物
    if (!fs.existsSync(distPath) || fs.readdirSync(distPath).length === 0) {
      log('fditor-ui构建产物为空', 'error')
      process.exit(1)
    }

    // 7. 构建Docker镜像
    const imageTag = `${imageName}:${newVersion}`
    log(`构建Docker镜像: ${imageTag}`)
    runCommand(`docker build -t ${imageTag} .`) // 根目录执行docker build

    // 8. 推送镜像到Docker Hub（如果提供了认证信息）
    if (dockerHubUsername && dockerHubPassword) {
      // 检查是否已登录，未登录则执行登录
      if (!checkDockerLogin()) {
        dockerLogin(dockerHubUsername, dockerHubPassword)
      }
      pushToDockerHub(imageTag, dockerHubUsername, imageName)
    } else {
      log('未提供Docker Hub认证信息，跳过镜像推送', 'warn')
    }

    // 9. 清理无标签镜像
    runCommand('docker image prune -f')

    // 10. 镜像提交完，提交git，并打tag
    gitCommitAndTag(newVersion)

    log(`构建完成！镜像: ${imageTag}`, 'success')
    if (dockerHubUsername) {
      log(`已推送至Docker Hub: ${dockerHubUsername}/${imageTag}`, 'success')
    }
    process.exit(0)
  } catch (error) {
    log(`构建失败: ${error.message}`, 'error')
    process.exit(1)
  }
}

main()
