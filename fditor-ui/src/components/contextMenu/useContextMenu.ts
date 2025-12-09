import { reactive } from 'vue'
import type { MenuItem, ContextMenuState } from './type'

/**
 * 全局菜单状态
 * 使用单例模式，整个应用共享一个菜单实例
 */
const globalMenuState = reactive<ContextMenuState>({
  visible: false,
  position: { x: 0, y: 0 },
  items: []
})

/**
 * 菜单项工厂函数类型
 * 接收 MouseEvent，返回菜单项数组
 */
export type MenuItemFactory = (e: MouseEvent) => MenuItem[] | Promise<MenuItem[]>

/**
 * 右键菜单 Composable
 * 
 * @param itemsOrFactory 菜单项配置或工厂函数
 * @returns onContextMenu 事件处理函数
 * 
 * @example 静态菜单
 * ```vue
 * <script setup>
 * const menuItems = [
 *   { label: '复制', id: '1', onSelect: () => console.log('复制') }
 * ]
 * const { onContextMenu } = useContextMenu(menuItems)
 * </script>
 * ```
 * 
 * @example 动态菜单
 * ```vue
 * <script setup>
 * const { onContextMenu } = useContextMenu((e) => {
 *   // 根据点击位置或目标动态生成菜单
 *   const target = getTargetFromEvent(e)
 *   if (target.type === 'image') {
 *     return [
 *       { label: '编辑图片', id: '1', onSelect: () => {} },
 *       { label: '删除图片', id: '2', onSelect: () => {} }
 *     ]
 *   }
 *   return [
 *     { label: '添加元素', id: '3', onSelect: () => {} }
 *   ]
 * })
 * </script>
 * ```
 */
export function useContextMenu(itemsOrFactory: MenuItem[] | MenuItemFactory) {
  /**
   * 右键菜单事件处理函数
   */
  async function onContextMenu(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    // 判断是静态菜单还是动态菜单
    let items: MenuItem[]
    if (typeof itemsOrFactory === 'function') {
      // 动态菜单：调用工厂函数生成菜单项
      items = await itemsOrFactory(e)
    } else {
      // 静态菜单：直接使用
      items = itemsOrFactory
    }
    
    // 更新全局菜单状态
    globalMenuState.visible = true
    globalMenuState.position = { x: e.clientX, y: e.clientY }
    globalMenuState.items = items
  }
  
  return {
    onContextMenu
  }
}

/**
 * 获取全局菜单状态
 * 供 ContextMenuProvider 组件使用
 */
export function useContextMenuState() {
  return globalMenuState
}

/**
 * 关闭菜单
 */
export function closeContextMenu() {
  globalMenuState.visible = false
}
