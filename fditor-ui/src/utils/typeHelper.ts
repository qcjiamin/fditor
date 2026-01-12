// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isError(obj: any): obj is Error {
  return obj instanceof Error
}
