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
    //! tag 是为了让本地镜像名与远程镜像名相同，这样才能正常推送；如果本身名字相同，直接push name:tag 会隐含tag命令
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

// 检查远程部署所需的环境变量
const checkRemoteEnv = () => {
  const requiredEnv = ['REMOTE_HOST', 'REMOTE_PORT', 'REMOTE_USER']

  // 检查基础必填项
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      log(`缺少远程部署必要环境变量: ${env}`, 'error')
      process.exit(1)
    }
  }

  // 检查认证方式（二选一）
  if (!process.env.REMOTE_SSH_KEY && !process.env.REMOTE_PASSWORD) {
    log('远程部署需要提供SSH密钥路径(REMOTE_SSH_KEY)或密码(REMOTE_PASSWORD)', 'error')
    process.exit(1)
  }
}
// 修复：执行远程SSH命令，确保正确连接
const runRemoteCommand = (host, port, user, authMethod, command) => {
  try {
    // 构建SSH连接基础命令，添加StrictHostKeyChecking=no避免首次连接确认
    let sshBase = `ssh -p ${port} -o StrictHostKeyChecking=no ${user}@${host}`

    // 处理认证方式
    if (authMethod.type === 'key') {
      // 修复：对密钥路径进行转义，处理空格等特殊字符
      const escapedKeyPath = authMethod.keyPath.replace(/(\s)/g, '\\$1')
      sshBase = `ssh -i ${escapedKeyPath} -p ${port} -o StrictHostKeyChecking=no ${user}@${host}`
    } else if (authMethod.type === 'password') {
      // 使用sshpass工具处理密码认证
      sshBase = `sshpass -p '${authMethod.password}' ${sshBase}`
    }

    // 对命令中的特殊字符进行转义
    const escapedCommand = command.replace(/"/g, '\\"').replace(/\$/g, '\\$')
    const fullCommand = `${sshBase} "${escapedCommand}"`

    log(`执行远程命令: ${fullCommand}`)
    execSync(fullCommand, { stdio: 'inherit' })
    return true
  } catch (error) {
    log(`远程命令执行失败: ${command}`, 'error')
    log(`错误信息: ${error.message}`, 'error')
    process.exit(1)
  }
}
// 远程部署主函数
const remoteDeploy = (newVersion, dockerHubUsername, imageName) => {
  const host = process.env.REMOTE_HOST
  const port = process.env.REMOTE_PORT || 22
  const user = process.env.REMOTE_USER
  const imageTag = `${dockerHubUsername}/${imageName}:${newVersion}`

  // 确定认证方式
  const authMethod = process.env.REMOTE_SSH_KEY
    ? { type: 'key', keyPath: process.env.REMOTE_SSH_KEY }
    : { type: 'password', password: process.env.REMOTE_PASSWORD }

  log(`开始远程部署到 ${user}@${host}:${port}`)

  // 先测试连接
  try {
    log('测试远程服务器连接...')
    runRemoteCommand(host, port, user, authMethod, 'echo "连接测试成功"')
  } catch (error) {
    log('远程服务器连接失败，请检查配置', 'error')
    process.exit(1)
  }

  // 执行远程部署命令
  /* docker run 优化方向
  1. 添加健康检查：确保容器启动后服务可用（如 HTTP 服务）：
  docker run -d --name ${imageName} -p 80:80 \
  --health-cmd "curl -f http://localhost:80/ || exit 1" \
  --health-interval 10s \
  --health-timeout 5s \
  --health-retries 3 \
  ${imageTag}
  2. 原子性部署：可先启动新容器，确认正常运行后再停止旧容器（避免服务中断）
  3. 日志输出：添加 --log-driver 和 --log-opt 配置日志（如限制大小），避免磁盘占满。 [网页服务好像不需要]
  4. 资源限制：通过 -m 512m --cpus 0.5 限制容器资源，防止影响主机。
  */
  const deployCommands = [
    `echo "${process.env.DOCKER_HUB_PASSWORD}" | docker login -u ${dockerHubUsername} --password-stdin`,
    // 记录当前运行的镜像ID（旧版本）,如果报错，重定向错误输出，始终true返回成功
    `OLD_IMAGE_ID=$(docker inspect --format='{{.Image}}' ${imageName} 2>/dev/null || true)``docker pull ${imageTag}`,
    `docker stop ${imageName} || true`,
    `docker rm ${imageName} || true`,
    `docker run -d --name ${imageName} -p 80:80 --restart always ${imageTag}`,
    // 如果存在旧镜像且与新镜像不同，则删除旧镜像
    `if [ -n "${OLD_IMAGE_ID}" ] && [ "${OLD_IMAGE_ID}" != "$(docker inspect --format='{{.Image}}' ${imageName})" ]; then
      echo "Removing old image: ${OLD_IMAGE_ID}"
      docker rmi ${OLD_IMAGE_ID} || true
    fi`// 移除悬空（无标签）镜像
    `docker image prune -f`,
    `docker logout`
  ]

  for (const cmd of deployCommands) {
    runRemoteCommand(host, port, user, authMethod, cmd)
  }

  log('远程部署完成', 'success')
}

// 主构建流程
const main = () => {
  try {
    log('开始项目构建流程...')
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
      log(`已推送至Docker Hub: ${dockerHubUsername}/${imageTag}`, 'success')
    } else {
      log('未提供Docker Hub认证信息，跳过镜像推送', 'warn')
    }

    // 9. 清理无标签镜像
    runCommand('docker image prune -f')

    // 10. 镜像提交完，提交git，并打tag
    gitCommitAndTag(newVersion)

    // 11. 远程部署
    if (process.env.REMOTE_HOST) {
      checkRemoteEnv()
      remoteDeploy(newVersion, dockerHubUsername, imageName)
    } else {
      log('未提供远程服务器信息，跳过自动部署', 'warn')
    }

    log(`构建完成！镜像: ${imageTag}`, 'success')
    process.exit(0)
  } catch (error) {
    log(`构建失败: ${error.message}`, 'error')
    process.exit(1)
  }
}

main()
