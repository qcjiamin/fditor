import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(
  {
    ignores: [
      '**/dist',
      '.vscode',
      '.idea',
      '*.sh',
      '**/node_modules',
      '*.md',
      '*.woff',
      '*.woff',
      '*.ttf',
      'yarn.lock',
      'package-lock.json',
      '/public',
      '/docs',
      '**/output',
      '.husky',
      '.local',
      '/bin',
      'Dockerfile'
    ]
  },
  {
    files: ['**/*.{ts,vue}'],
    extends: [
      //* 可以不适用extends, 直接放置在最外层
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended']
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser
      }
    },
    rules: {
      // your rules
    }
  },
  // {
  //   rules: {
  //     indent: ['error', 2],
  //     // indent: "off",
  //     semi: ['error', 'never'], // 语句末尾不加分号
  //     'vue/multi-word-component-names': 'off' // 关闭vue组件必须 xx-xx 的命名
  //   }
  // },
  // {
  //   files: ['**/*.vue'], // vue 的缩进判断会导致冲突，这路取消其缩进判断
  //   rules: {
  //     indent: 'off'
  //   }
  // },
  eslintConfigPrettier
)
