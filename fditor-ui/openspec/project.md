# 项目上下文

## 项目目的
fditor-ui 是基于 Vue 3 的 fditor 编辑器平台用户界面。它提供了一个现代化、响应式的网页界面，用于创建和编辑内容，专注于性能和用户体验。该项目是 fditor 生态系统的前端部分，与核心库集成以提供丰富的编辑体验。

## 技术栈
- Vue 3 (包含组合式 API 和 <script setup>)
- TypeScript (严格模式)
- Vite (打包工具和开发服务器)
- Element Plus (UI组件库)
- Pinia (状态管理)
- Sass/SCSS (CSS 预处理器)
- Fabric.js (画布操作)
- VueUse (实用函数)
- Hotkeys.js (键盘快捷键)
- Floating UI (定位引擎)

## 项目规范

### 代码风格
- 使用启用了严格模式的 TypeScript
- 组件名称遵循帕斯卡命名法(PascalCase)
- 可组合函数和实用函数使用驼峰命名法(camelCase)
- ESLint 进行代码检查，禁用自动修复以保持手动控制
- 导入路径使用 @ 别名指向 src 目录（例如 "@/components/Example.vue"）
- SCSS 变量和混合宏通过 vite.config.ts 中的 additionalData 全局可访问
- 在单文件组件(SFC)中使用带 <script setup> 语法的组合式 API

### 架构模式
- 基于组件的架构，具有清晰的关注点分离
- 使用 Pinia 进行集中式状态管理，仓库位于 src/stores
- 在 src/hooks 中存放可复用逻辑的可组合函数
- 使用全局 SCSS 变量实现一致的样式
- 模块化结构，具有特定功能的目录
- 通过 src/events 目录进行事件管理
- 在 src/types 中定义类型以提高类型安全性

### 测试策略
- 使用 Vue Test Utils 进行组件测试（当前基础模板中尚未实现）
- 对可组合函数和实用函数进行单元测试
- 对复杂组件交互进行集成测试
- 使用 Playwright 或 Cypress 进行端到端测试（待实现）

### Git 工作流程
- 特性分支工作流（feature/..., bugfix/... 等）
- 使用约定式提交来标准化提交信息
- 合并到主分支需要拉取请求
- 至少由一名其他团队成员进行代码审查
- 合并前进行自动化代码检查和构建检查

## 领域上下文
- 项目与 @fditor/core 库集成以获得编辑器功能
- 通过 Fabric.js 实现基于画布的渲染，以获得丰富的编辑能力
- 为 UI 元素实现拖放功能
- 包含颜色选择器和其他设计工具
- 键盘快捷键系统以增强用户生产力
- 用于内容显示的瀑布流布局
- 通过 vite-svg-loader 进行自定义处理的 SVG 图标

## 重要约束
- 与现代浏览器兼容（ES2020+）
- 针对大型画布操作的性能优化
- 通过 UI 与业务逻辑之间的清晰分离确保可维护性
- 与 Element Plus 组件的无障碍访问合规性（a11y）
- 针对多种屏幕尺寸的响应式设计
- 与 @fditor/core 库的版本兼容性

## 外部依赖
- @fditor/core: 核心编辑器库（本地依赖）
- Element Plus: UI 组件库
- Fabric.js: 画布操作和图形
- VueUse: Vue 可组合函数集合
- Axios: 用于 API 请求的 HTTP 客户端
- Hotkeys.js: 键盘快捷键管理
- Floating UI: 类似 Popper 的定位系统
- Vue Color Kit: 颜色选择功能
- Mock.js: 用于开发的模拟数据
