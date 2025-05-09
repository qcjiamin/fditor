export const tabNames = ['image', 'video', 'text', 'shape'] as const

export type TabName = (typeof tabNames)[number]
