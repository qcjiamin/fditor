/**
 * Fabric.js 模块扩展
 * 扩展 FabricObject 接口，添加自定义属性
 */
declare module 'fabric' {
  interface FabricObject {
    /**
     * 对象的唯一标识符
     * 用于历史记录、选中状态恢复等功能
     */
    id: string
  }
}

export {}
