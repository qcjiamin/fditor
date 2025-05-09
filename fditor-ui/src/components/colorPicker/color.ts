const INT_HEX_MAP = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' }
const HEX_INT_MAP = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 }
const to16 = (value: number) => {
  value = Math.min(Math.round(value), 255)
  const high = Math.floor(value / 16)
  const low = value % 16
  return (
    '' + (INT_HEX_MAP[high as keyof typeof INT_HEX_MAP] || high) + (INT_HEX_MAP[low as keyof typeof INT_HEX_MAP] || low)
  )
}
export const rgb2hex = (r: number, g: number, b: number) => {
  if (isNaN(r) || isNaN(g) || isNaN(b)) return ''

  return '#' + to16(r) + to16(g) + to16(b)
}
export const hex2rgb = (hex: string) => {
  const hexStr = hex.substring(1)
  const result = [0, 0, 0]
  for (let i = 0; i < 6; i = i + 2) {
    const high = (HEX_INT_MAP[hexStr[i].toUpperCase() as keyof typeof HEX_INT_MAP] || +hexStr[i]) * 16
    const low = HEX_INT_MAP[hexStr[i + 1].toUpperCase() as keyof typeof HEX_INT_MAP] || +hexStr[i + 1]
    result[i / 2] = high + low
  }
  return {
    r: result[0],
    g: result[1],
    b: result[2],
    color: `rgb(${result[0]},${result[1]},${result[2]})`
  }
}
function str2Num(str: string) {
  const c = str.match(/[0-9]+/)
  if (c) {
    return Number(c[0])
  }
  return parseFloat(str)
}
export const formatColor = (r: number, g: number, b: number, a: number, type: string = 'rgba'): string => {
  if (type === 'rgba') {
    return `rgba(${r},${g},${b},${a})`
  } else if (type === 'rgb') {
    return `rgb(${r},${g},${b})`
  } else if (type === 'hex') {
    return rgb2hex(r, g, b)
  } else if (type === 'hsl') {
    const { h, s, l } = rgb2hsl(r, g, b)
    return `hsl(${h}deg,${s}%,${l}%)`
  }
  return `rgba(${r},${g},${b},${a})`
}

export const getRgba = (str: string) => {
  if (!str) return { r: 0, g: 0, b: 0, a: 0, color: 'rgba(0, 0, 0, 1)' }
  if (str.indexOf('hsl(') === 0) {
    const s = str
      .slice(4, str.length - 1)
      .replace(/\s/g, '')
      .split(',')
      .map((a: string) => str2Num(a))
    const c = hsl2rgb(s[0], s[1], s[2])
    return { ...c, a: 1, color: `rgba(${c.r},${c.g},${c.b},1)` }
  } else if (str.indexOf('rgba(') === 0) {
    const s = str
      .slice(5, str.length - 1)
      .replace(/\s/g, '')
      .split(',')
      .map((a: string) => Number(a))
    return { r: s[0], g: s[1], b: s[2], a: s[3], color: `rgba(${s[0]},${s[1]},${s[2]},${s[3]})` }
  } else if (str.indexOf('rgb(') === 0) {
    const s = str
      .slice(4, str.length - 1)
      .replace(/\s/g, '')
      .split(',')
      .map((a: string) => Number(a))
    return { r: s[0], g: s[1], b: s[2], a: 1, color: `rgba(${s[0]},${s[1]},${s[2]},1)` }
  } else if (str.indexOf('#') === 0) {
    let res
    if (str.length === 7) res = str
    else if (str.length === 4) res = `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`
    else if (str.length === 3) res = `#${str[1]}${str[1]}${str[1]}${str[2]}${str[2]}${str[2]}`
    if (res) {
      const c = hex2rgb(res)
      return { ...c, a: 1, color: `rgba(${c.r},${c.g},${c.b},1)` }
    }
  }
  return { r: 0, g: 0, b: 0, a: 0, color: 'rgba(0, 0, 0, 1)' }
}

/**
 *  rgb转hsv
 * @param r
 * @param g
 * @param b
 * @returns 返回通常意义上的hsv，以及归一化的hsv
 */
export const rgb2hsv = (r: number, g: number, b: number) => {
  r = r / 255
  g = g / 255
  b = b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number = 0,
    s: number = 0
  const v = max

  const d = max - min
  s = max === 0 ? 0 : d / max

  if (max === min) {
    h = 0 // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, v: v * 100, h1: h, s1: s, v1: v }
}

export const hsv2rgb = (h: number, s: number, v: number) => {
  h = (h * 360) % 360
  // s = Math.max(0, Math.min(1, s))
  // v = Math.max(0, Math.min(1, v))

  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0,
    g = 0,
    b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

export const hueToRGB = (h: number) => {
  return hsv2rgb(h, 1, 1) // 饱和度、亮度固定为 1, 这样可以将hsv的h提取为纯色
}

export function rgb2hsl(r: number, g: number, b: number) {
  r = r / 255
  g = g / 255
  b = b / 255

  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  let l = (min + max) / 2
  const d = max - min
  let h = 0
  let s = 1
  let s1 = 0
  let l1 = 0
  let h1 = 0

  if (max == min) {
    h = 0
    s = 0
  } else {
    s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = 2.0 + (b - r) / d
        break
      case b:
        h = 4.0 + (r - g) / d
        break
    }
    h1 = (h * 60) / 360
    h = Math.round(h * 60)
  }
  s1 = s
  s = Math.round(s * 100) //转换成百分比的形式
  l1 = l
  l = Math.round(l * 100)
  return {
    h,
    s,
    l,
    h1,
    l1,
    s1
  }
}

export function hsl2rgb(h: number, s: number, l: number) {
  h = h / 360
  s = s / 100
  l = l / 100
  let rgb: number[] = []

  if (s == 0) {
    rgb = [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)]
  } else {
    const q = l >= 0.5 ? l + s - l * s : l * (1 + s)
    const p = 2 * l - q
    rgb[0] = h + 1 / 3
    rgb[1] = h
    rgb[2] = h - 1 / 3
    for (let i = 0; i < rgb.length; i++) {
      let tc = rgb[i]
      if (tc < 0) {
        tc = tc + 1
      } else if (tc > 1) {
        tc = tc - 1
      }
      switch (true) {
        case tc < 1 / 6:
          tc = p + (q - p) * 6 * tc
          break
        case 1 / 6 <= tc && tc < 0.5:
          tc = q
          break
        case 0.5 <= tc && tc < 2 / 3:
          tc = p + (q - p) * (4 - 6 * tc)
          break
        default:
          tc = p
          break
      }
      rgb[i] = Math.round(tc * 255)
    }
  }

  return { r: rgb[0], g: rgb[1], b: rgb[2] }
}

export type ColorType = 'rgb' | 'rgba' | 'hsv' | 'hsva' | 'hex' | 'unknown'

export function detectColorType(input: string): ColorType {
  const str = input.trim().toLowerCase()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{8})$/.test(str)) {
    return 'hex'
  }

  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(str)) {
    return 'rgb'
  }

  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(str)) {
    return 'rgba'
  }

  if (/^hsv\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/.test(str)) {
    return 'hsv'
  }

  if (/^hsva\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(str)) {
    return 'hsva'
  }

  return 'unknown'
}
