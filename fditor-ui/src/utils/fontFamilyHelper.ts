import { fontWeightMap } from '@/utils/constants'
import {
  typedFontInfo,
  type FontFamilyName,
  type FontStyle,
  type FontWeight,
  type SubFontFamilyInfo
} from '@/utils/types'

/**
 * 加载指定字体
 * @param {string} family - 字体族名
 * @param {boolean} bold
 *  * @param {boolean} italic
 * @returns
 */
export async function loadFont(
  familyName: string,
  fileName: string,
  weight: FontWeight,
  style: FontStyle = 'normal',
  signal: AbortSignal | null = null
) {
  // const href = 'https://static.vidnoz.com/web/fonts/'

  const weightNum = fontWeightMap[weight]
  const url = `http://localhost:7777/resource/ffonts/${fileName}`

  let needload = true
  document.fonts.forEach((value) => {
    if (value.family === familyName) {
      if (value.weight === weightNum.toString() && value.style === style) {
        needload = false
      }
    }
  })

  if (!needload) return
  const res = await fetch(url, { signal })
  signal?.throwIfAborted()
  const data = await res.arrayBuffer()
  signal?.throwIfAborted()

  const font = new FontFace(familyName, data, {
    weight: weightNum.toString(),
    style: style
  })
  document.fonts.add(font)
  await font
    .load()
    .then(() => {
      console.log(fileName, '字体加载完成')
    })
    .catch((err) => {
      console.log(fileName + ' 加载失败')
      console.log(err)
    })
}

/**
 * 加载字体族的所有字体。可中断
 * @param fontFamily
 * @param signal
 */
export async function loadFontFamily(fontFamily: FontFamilyName, signal: AbortSignal | null = null) {
  const familyLevel = typedFontInfo[fontFamily]
  const tasks: Promise<void>[] = []
  familyLevel.forEach((item) => {
    tasks.push(loadFont(fontFamily, item.fileName, item.weight, item.style, signal))
  })
  await Promise.all(tasks)
}

/**
 * 查找指定字体在指定风格下的regular及以下字重的数据，字重从大到小排序
 * @param fontFamily
 */
export function findSortRegular(fontFamily: FontFamilyName, style: FontStyle) {
  const familyLevel = typedFontInfo[fontFamily]
  const smallArr = familyLevel.filter((item) => {
    return fontWeightMap[item.weight] <= 400 && item.style === style
  })
  smallArr.sort((a, b) => fontWeightMap[b.weight] - fontWeightMap[a.weight])
  return smallArr
}

/**
 * 获取取消加粗时应该设置的字体。小于等于400的字体中，最大的一个
 * @param fontFamily
 * @param style
 * @returns
 */
export function getRegularFont(fontFamily: FontFamilyName, style: FontStyle) {
  const smallArr = findSortRegular(fontFamily, style)
  if (smallArr.length < 1) throw new Error('cancel bold, but no small font')
  return smallArr[0]
}

/**
 * 查找指定字体在指定风格下的regular及以下字重的数据，字重从小到大排序
 * @param fontFamily
 */
export function findSortBold(fontFamily: FontFamilyName, style: FontStyle) {
  const familyLevel = typedFontInfo[fontFamily]
  const bigArr = familyLevel.filter((item) => {
    return fontWeightMap[item.weight] > 400 && item.style === style
  })
  bigArr.sort((a, b) => fontWeightMap[a.weight] - fontWeightMap[b.weight])
  return bigArr
}

/**
 * 获取设置加粗时应该设置的字体。大于400的字体重，Bold的优先级最高，如果没有，取最小的
 * @param fontFamily
 * @param style
 */
export function getBoldFont(fontFamily: FontFamilyName, style: FontStyle) {
  const bigArr = findSortBold(fontFamily, style)
  if (bigArr.length <= 0) throw new Error('set bold, but no small font')
  const boldArr = bigArr.filter((item) => {
    return item.weight === 'bold'
  })
  if (boldArr.length > 0) return boldArr[0]
  return bigArr[0]
}

/**
 * 指定字体在指定风格下是否可以加粗
 * @param fontFamily
 * @param style
 * @returns
 */
export function canFontBeBold(fontFamily: FontFamilyName, style: FontStyle): boolean {
  const familyLevel = typedFontInfo[fontFamily]
  //! 是否有regular及以下的字体，没有的话就没有加粗的概念
  const smallArr = familyLevel.filter((item) => {
    return fontWeightMap[item.weight] <= 400 && item.style === style
  })
  if (smallArr.length <= 0) return false

  const boldArr = familyLevel.filter((item) => {
    return fontWeightMap[item.weight] > 400
  })
  const filterArr = findItemByStyle(boldArr, style)
  return filterArr.length > 0
}

/**
 * 指定字体在指定风格下是否可以加粗
 * @param fontFamily
 * @param style
 * @returns
 */
export function canFontBeItalic(fontFamily: FontFamilyName, weight: FontWeight): boolean {
  const familyLevel = typedFontInfo[fontFamily]
  const styleArr = findItemByStyle(familyLevel, 'italic')
  const filterArr = styleArr.filter((item) => {
    return item.weight === weight
  })
  return filterArr.length > 0
}

/**
 * 从字体信息表中找到指定字体和字重的数据
 * @param name
 * @param weight
 * @returns
 */
export function findItemByWeight(Infos: SubFontFamilyInfo[], weight: FontWeight) {
  return Infos.filter((familyInfo) => familyInfo.weight === weight)
}

/**
 * 从字体信息表中找到指定字体和风格的数据
 * @param name
 * @param weight
 * @returns
 */
export function findItemByStyle(Infos: SubFontFamilyInfo[], style: FontStyle) {
  return Infos.filter((familyInfo) => familyInfo.style === style)
}
