import { defineConfig } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      defaultImport: 'component'
    }),
    eslint({
      exclude: ['**/node_modules/**', 'dist/**'], // 排除所有 node_modules 文件夹之外的文件都进行 eslint 检查
      // 是否自动修复
      // fix: true,
      // 是否启用缓存
      cache: false
    })
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
        additionalData: `@use '@/styles/variables.scss' as *; @use '@/styles/svg.scss' as *;`
      }
    }
  }
})
