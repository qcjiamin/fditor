import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// 文档推荐 vite-plugin-eslint， 但是该插件与新版ts不兼容，这里使用2
import eslint from 'vite-plugin-eslint2'
import { resolve } from 'path'
import svgLoader from 'vite-svg-loader'
// element-plus 组件按需自动导入
// https://element-plus.org/zh-CN/guide/quickstart.html#%E6%8C%89%E9%9C%80%E5%AF%BC%E5%85%A5
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 自定义插件：当修改核心库文件时强制完全刷新
function forceReloadOnCoreChange() {
  return {
    name: 'force-reload-on-core-change',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleHotUpdate({ file, server }: { file: string; server: any }) {
      // 当修改 packages/core 下的文件时，强制完全刷新页面
      if (file.includes('packages\\core') || file.includes('packages/core')) {
        console.log('Core library changed, forcing full reload...')
        server.ws.send({
          type: 'full-reload',
          path: '*'
        })
        return []
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  // 环境常量替换
  const define = {
    APP_VERSION: JSON.stringify(env.APP_VERSION)
  }
  return {
    define,
    plugins: [
      vue(),
      svgLoader({
        defaultImport: 'component',
        //todo 为true时，渐变色类型的图标会全部渲染第一个。类型defs定义在了全局一样
        svgo: false
      }),
      eslint({
        exclude: ['**/node_modules/**', 'dist/**'], // 排除所有 node_modules 文件夹之外的文件都进行 eslint 检查
        // 是否自动修复
        // fix: true,
        // 是否启用缓存
        cache: false
      }),
      forceReloadOnCoreChange()
      // AutoImport({
      //   resolvers: [ElementPlusResolver()]
      // }),
      // Components({
      //   resolvers: [ElementPlusResolver()]
      // })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      },
      // alias: [
      //   { find: '@', replacement: resolve(__dirname, './src') },
      // ],

      extensions: ['.js', '.ts', '.json', '.vue']
    },
    css: {
      /* css 预处理器 */
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use '@/styles/variables.scss' as *; 
          @use '@/styles/svg.scss' as *;
        `
        }
      }
    }
  }
})
