import { Gradient } from 'fabric'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isError(obj: any): obj is Error {
  return obj instanceof Error
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isGradient(obj: any): obj is Gradient<'linear' | 'radial'> {
  return obj instanceof Gradient
}
