// 类型工具单元

/** 提取对象的制定属性的类型
 * @example
 * interface User {
 *   id: number
 *   name: string
 * }
 * type UserNameType = PropType<User, 'name'> // string
 */
export type PropType<T, K extends keyof T> = T[K]
