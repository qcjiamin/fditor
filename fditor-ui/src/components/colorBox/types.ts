export const colorTypeArr = ['solid', 'gradient'] as const
export type colorTypes = (typeof colorTypeArr)[number]
