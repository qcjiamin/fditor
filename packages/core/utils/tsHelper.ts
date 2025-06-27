/** 提取对象的制定属性的类型 */
export type PropType<T, K extends keyof T> = T[K]
