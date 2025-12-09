/**
 * 菜单项配置接口
 */
export interface MenuItem {
  /** 菜单项显示文本 */
  label: string
  /** 唯一标识符 */
  id: string | symbol
  /** 图标（可选） */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为分隔线 */
  divider?: boolean
  /** 子菜单项 */
  submenu?: MenuItem[]
  /** 点击回调函数 */
  onSelect?: () => void
  /** 快捷键提示（可选） */
  shortcut?: string
}

/**
 * 菜单位置
 */
export interface MenuPosition {
  x: number
  y: number
}

/**
 * 全局菜单状态
 */
export interface ContextMenuState {
  visible: boolean
  position: MenuPosition
  items: MenuItem[]
}
