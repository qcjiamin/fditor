export const tabNames = ['resource', 'animation', 'fonts'] as const
export type TabName = (typeof tabNames)[number]
