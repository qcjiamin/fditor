import { FabricObject } from 'fabric'

export type Selected = FabricObject | undefined
export enum ElementType {
  bg = 'bg',
  shape = 'shape',
  image = 'image',
  text = 'text'
}

export const ElementTypeArr = ['bg', 'Shape', 'image', 'text', 'activeselection'] as const
export type ElementTypes = (typeof ElementTypeArr)[number]

export const GradientTypeArr = ['linear90', 'linear180', 'linear135', 'radial50', 'radial0'] as const
export type GradientTypes = (typeof GradientTypeArr)[number]

// const test: keyof ElementType  = 'Bg'
// console.log(test)

// const person = { x: '123', y: 123 }
// type Point = { x: number; y: number }
// type keyPoint = keyof Point
// type typePoint = typeof person

// const a: keyPoint = 'y'
// const b: typePoint = {}

// type Mapish = { [k: string]: boolean }
// type M = keyof Mapish
