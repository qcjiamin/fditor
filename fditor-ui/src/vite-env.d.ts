/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare const APP_VERSION: string

interface ViteTypeOptions {
  // 添加这行代码，你就可以将 ImportMetaEnv 的类型设为严格模式，
  // 这样就不允许有未知的键值了。
  strictImportMetaEnv: unknown
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
interface ImportMetaEnv {
  // api 地址
  readonly VITE_API_URL: string
}
