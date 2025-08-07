# 构建阶段：处理monorepo依赖并构建fditor-ui
FROM node:20-alpine AS build-stage
RUN node -v && npm -v
WORKDIR /app

# 1. 复制根目录依赖配置（关键：安装workspaces依赖）
COPY package.json yarn.lock ./
# 复制子项目的package.json（让Yarn识别workspaces结构）
COPY fditor-ui/package.json ./fditor-ui/
COPY packages/core/package.json ./packages/core/

# 2. 安装所有依赖（包括workspaces中的本地包）
RUN yarn install --frozen-lockfile

# 3. 复制所有项目代码（此时依赖已安装，避免重复安装）
COPY . .

# 4. 单独构建fditor-ui（指定工作目录）
WORKDIR /app/fditor-ui
RUN yarn run build  # 执行fditor-ui的build脚本

# 生产阶段：部署到Nginx
FROM nginx:stable-alpine AS production-stage
# 从构建阶段复制fditor-ui的构建产物
COPY --from=build-stage /app/fditor-ui/dist /usr/share/nginx/html
# 复制Nginx配置（建议放在根目录或fditor-ui目录下）
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
    