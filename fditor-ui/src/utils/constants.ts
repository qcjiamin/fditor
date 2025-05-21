export const tabNames = ['image', 'video', 'text', 'shape'] as const
export type TabName = (typeof tabNames)[number]

export const sidebarPropertyTypes = ['', 'animate', 'effect'] as const
/** 侧边栏显示的属性*/
export type sidebarPropertyType = (typeof sidebarPropertyTypes)[number]
