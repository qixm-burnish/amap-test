/**
 * 传入一个对象，和键集合，返回对应的对象中的键值对
 * @param obj
 * @param keys
 */
export const subset = <
  O extends { [key in string]: unknown },
  K extends keyof O
>(
  obj: O,
  keys: K[]
) => {
  const filteredEntries = Object.entries(obj).filter(([key]) =>
    keys.includes(key as K)
  )
  return Object.fromEntries(filteredEntries) as Pick<O, K>
}
/**
 * 删除传入对象的空值字段
 * @param obj
 * @returns
 */
export const cleanObject = <T>(obj?: T): T => {
  if (!obj) {
    return {} as T
  }
  const result = { ...obj }
  Object.keys(result).forEach((key) => {
    const value = result[key]
    if (value === undefined || value === null || value === '') {
      delete result[key]
    }
  })

  return result
}
interface Returned {
  [key: string]: any
}

// 将值为空的字段删除
export function deletObjEmptyValue(
  obj: Record<string, unknown>
): Record<string, unknown> {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === '' || obj[key] === null || obj[key] === undefined)
      delete obj[key]
    else if (typeof obj[key] === 'object')
      deletObjEmptyValue(obj[key] as Record<string, unknown>)
  })
  return obj
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(arg?: any) {}
