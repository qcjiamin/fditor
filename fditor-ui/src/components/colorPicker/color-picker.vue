<!-- Todo -->
<!-- 1. 性能优化, 拖动修改时节流 -->
<!-- 2. hue point 使用更好的形状来绘制 -->
<!-- 3. 增加 透明度属性控制-->
<!-- 4. 代码优化检查 -->
<!-- 当前是以hsv为基础，应该以传入的color为数据源，来保证数据从上至下的响应性？ -->

<script lang="ts" setup>
  import { getRgba, hsv2rgb, hueToRGB, rgb2hex, rgb2hsv } from '@/components/colorPicker/color'
  import { _toFixed, originToMat3, switchPointFromCoordinateSystemAToB } from '@/utils/common'
  import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import hexInput from '@/components/colorPicker/hex-input.vue'
  import rgbInput from '@/components/colorPicker/rgb-input.vue'
  const svcvs = ref<HTMLCanvasElement>()
  const hcvs = ref<HTMLCanvasElement>()
  const ocvs = ref<HTMLCanvasElement>()
  let hctx: CanvasRenderingContext2D | null = null
  let svctx: CanvasRenderingContext2D | null = null
  let octx: CanvasRenderingContext2D | null = null
  let inHueMoving = false // 拖动色相条
  let inSVMoving = false // 拖动明暗区
  let inOpacityMoving = false
  let firstSet = true
  // 缓存上次返回的颜色值
  let lastColor = ''
  const emit = defineEmits(['update:color'])
  function emitColor(color: string) {
    lastColor = color
    emit('update:color', color)
  }

  const { color = 'rgba(255,255,255,1)' } = defineProps<{
    color?: string
  }>()

  const state = reactive({
    hsv: {} as { h: number; s: number; v: number },
    a: -1
  })
  const rgbInfo = computed(() => {
    return getRgba(color)
  })

  enum ColorTypes {
    hex = 'hex',
    rgb = 'rgb'
  }
  const colorType = ref<ColorTypes>(ColorTypes.hex)
  const isHex = computed(() => {
    return colorType.value === ColorTypes.hex
  })
  const hexRef = computed(() => {
    const rgbaObj = getRgba(color)
    if (!rgbaObj) return 'FFFFFF'
    return rgb2hex(rgbaObj?.r, rgbaObj?.g, rgbaObj.b).replace('#', '')
  })

  watch(
    () => color,
    (color) => {
      if (color === lastColor) return
      //! 更新lastColor, 2个元素互相切换时，直接从外部修改的color, lastColor 不更新会导致画布不会重新渲染
      lastColor = color
      // 计算hsva
      const rgbaObj = getRgba(color)
      state.a = rgbaObj.a
      const hsvObj = rgb2hsv(rgbaObj.r, rgbaObj.g, rgbaObj.b)
      state.hsv = {
        h: hsvObj.h1,
        s: hsvObj.s1,
        v: hsvObj.v1
      }
    },
    { immediate: true } //! 开始就触发一次，重要
  )

  // interface DataColor {
  //   color: string
  //   r: number
  //   g: number
  //   b: number
  // }

  /**
   * 根据鼠标点击位置取颜色值
   * @param imgData 色相条的 imageData
   * @param i 色相条上的 X
   */
  // const getImageDataColor = (imgData: Uint8ClampedArray, i: number): DataColor | undefined => {
  //   // i = i * 4
  //   if (i >= 0 && i <= imgData.length - 4) {
  //     const r = imgData[i]
  //     const g = imgData[i + 1]
  //     const b = imgData[i + 2]
  //     const color = `rgb(${r},${g},${b})`

  //     return {
  //       color,
  //       r,
  //       g,
  //       b
  //     }
  //   }
  // }

  // 注意： 开始的红色是0.01的位置，结束的红色是0.99的位置，避免取不到红色。
  /**绘制色相 */
  function renderHcvs() {
    const huelist = [
      'hsl(0deg, 100%, 50%)',
      'hsl(60deg, 100%, 50%)',
      'hsl(120deg, 100%, 50%)',
      'hsl(180deg, 100%, 50%)',
      'hsl(240deg, 100%, 50%)',
      'hsl(300deg, 100%, 50%)',
      'hsl(360deg, 100%, 50%)'
    ]
    // 重新赋值宽度可以清空画布
    hcvs.value!.width = hcvs.value!.clientWidth
    hcvs.value!.height = hcvs.value!.clientHeight
    hctx = hcvs.value!.getContext('2d')
    if (!hctx) return
    const gradient = hctx.createLinearGradient(0, 0, hcvs.value!.width, 0)
    const len = huelist.length
    huelist.forEach((color, idx) => {
      if (idx === 0) {
        gradient.addColorStop(0.01, color)
      } else if (idx === len - 1) {
        gradient.addColorStop(0.99, color)
      } else {
        gradient.addColorStop(idx / (len - 1), color)
      }
    })
    hctx.fillStyle = gradient
    hctx.fillRect(0, 0, hcvs.value!.width, hcvs.value!.height)
  }
  function renderHuePoint(x: number) {
    // 以点为中心，画一个矩形
    if (!hctx) return
    hctx.save()
    hctx.strokeStyle = 'white'
    hctx.lineWidth = 3
    hctx.lineJoin = 'round'
    hctx.shadowColor = 'black'
    hctx.shadowBlur = 3
    hctx.strokeRect(x - 3, 0, 6, hcvs.value!.height)
    hctx.restore()
  }

  function hueMouseDown(e: MouseEvent) {
    // 当前颜色
    state.hsv.h = e.offsetX / hcvs.value!.width

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)

    inHueMoving = true
  }

  function getXInHcvs(e: MouseEvent) {
    const bodyMat = originToMat3({ x: 0, y: 0 })
    const hRect = hcvs.value!.getBoundingClientRect()
    const hueMat = originToMat3({ x: hRect.left, y: hRect.top })
    const pInHue = switchPointFromCoordinateSystemAToB(bodyMat, hueMat, { x: e.x, y: e.y })
    let _x = pInHue.x
    _x = Math.max(0, _x)
    // 宽300, 像素点应该是 0 - 299
    // _x = Math.min(hcvs.value!.width - 1, _x)
    _x = Math.min(hcvs.value!.width, _x)
    return _x
  }
  function hueMouseUp(e: MouseEvent) {
    if (!inHueMoving) return
    const x = getXInHcvs(e)
    state.hsv.h = x / hcvs.value!.width

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)
    inHueMoving = false
  }
  function hueMouseMove(e: MouseEvent) {
    if (!inHueMoving) return

    const x = getXInHcvs(e)
    state.hsv.h = x / hcvs.value!.width
    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)
  }

  // 颜色深浅, 明暗
  function renderSVcvs() {
    if (!svcvs.value) return
    svcvs.value!.width = svcvs.value!.clientWidth
    svcvs.value!.height = svcvs.value!.clientHeight
    svctx = svcvs.value!.getContext('2d')

    if (!svctx) return
    // 获取色相
    const hRgb = hueToRGB(state.hsv.h)
    // 先将画布以选中颜色绘制一次
    svctx.fillStyle = `rgb(${hRgb.r}, ${hRgb.g}, ${hRgb.b})`
    svctx.fillRect(0, 0, svcvs.value.width, svcvs.value.height)

    //! 先白再画黑
    // 左-右，白色-透明层
    const gradientS = svctx.createLinearGradient(0, 0, svcvs.value!.width, 0)
    gradientS.addColorStop(0.01, 'white')
    gradientS.addColorStop(0.99, 'rgba(255,255,255,0)')
    svctx.fillStyle = gradientS
    svctx.fillRect(0, 0, svcvs.value.width, svcvs.value.height)

    // 上-下 透明-黑色层
    const gradientV = svctx.createLinearGradient(0, 0, 0, svcvs.value.height)
    gradientV.addColorStop(0.01, 'rgba(0,0,0,0)')
    gradientV.addColorStop(0.99, 'black')
    svctx.fillStyle = gradientV
    svctx.fillRect(0, 0, svcvs.value.width, svcvs.value.height)
  }

  function getXYInSVcvs(e: MouseEvent) {
    const bodyMat = originToMat3({ x: 0, y: 0 })
    const svRect = svcvs.value!.getBoundingClientRect()
    const svMat = originToMat3({ x: svRect.left, y: svRect.top })
    const pInSv = switchPointFromCoordinateSystemAToB(bodyMat, svMat, { x: e.x, y: e.y })
    let _x = pInSv.x
    _x = Math.max(0, _x)
    _x = Math.min(svcvs.value!.width, _x)
    let _y = pInSv.y
    _y = Math.max(0, _y)
    _y = Math.min(svcvs.value!.height, _y)
    return { x: _x, y: _y }
  }

  function renderSVPoint(x: number, y: number) {
    // 以点为中心，画一个圆
    if (!svctx) return
    svctx.save()
    // 半径
    const radius = 4
    svctx.beginPath()
    svctx.arc(x, y, radius, 0, Math.PI * 2) // 从 0 到 2π 绘制完整圆
    svctx.strokeStyle = 'white'
    // 加阴影，避免在相同色时看不到
    svctx.shadowColor = 'black'
    svctx.shadowBlur = 3
    svctx.lineWidth = 2
    svctx.stroke()
    svctx.restore()
  }

  function svMouseDown(e: MouseEvent) {
    // // 当前颜色
    state.hsv.s = e.offsetX / svcvs.value!.width
    // // 从上到下，明-暗，值越大越亮
    state.hsv.v = 1 - e.offsetY / svcvs.value!.height

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)
    inSVMoving = true
  }
  function svMouseUp(e: MouseEvent) {
    if (!inSVMoving) return
    const pInSv = getXYInSVcvs(e)
    state.hsv.s = pInSv.x / svcvs.value!.width
    state.hsv.v = 1 - pInSv.y / svcvs.value!.height

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)

    inSVMoving = false
  }
  function svMouseMove(e: MouseEvent) {
    if (!inSVMoving) return
    const pInSv = getXYInSVcvs(e)
    state.hsv.s = pInSv.x / svcvs.value!.width
    state.hsv.v = 1 - pInSv.y / svcvs.value!.height

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)
  }

  // 透明条
  function renderOcvs(x: number) {
    if (!ocvs.value) return

    ocvs.value!.width = ocvs.value!.clientWidth
    ocvs.value!.height = ocvs.value!.clientHeight
    octx = ocvs.value!.getContext('2d')
    if (!octx) return
    const rgb = `${rgbInfo.value.r}, ${rgbInfo.value.g},${rgbInfo.value.b}`
    const gradient = octx.createLinearGradient(0, 0, svcvs.value!.width, 0)
    gradient.addColorStop(0, `rgba(${rgb},0)`)
    gradient.addColorStop(1, `rgba(${rgb},1)`)
    octx.fillStyle = gradient
    octx.fillRect(0, 0, ocvs.value.width, ocvs.value.height)
    // 画point
    // 以点为中心，画一个矩形
    octx.save()
    octx.strokeStyle = 'white'
    octx.lineWidth = 3
    octx.lineJoin = 'round'
    octx.shadowColor = 'black'
    octx.shadowBlur = 3
    octx.strokeRect(x - 3, 0, 6, hcvs.value!.height)
    octx.restore()
  }

  function oMouseDown(e: MouseEvent) {
    // 当前颜色
    state.a = _toFixed(e.offsetX / ocvs.value!.width, 2)

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)

    inOpacityMoving = true
  }
  function getXInOcvs(e: MouseEvent) {
    const bodyMat = originToMat3({ x: 0, y: 0 })
    const oRect = ocvs.value!.getBoundingClientRect()
    const oMat = originToMat3({ x: oRect.left, y: oRect.top })
    const pInO = switchPointFromCoordinateSystemAToB(bodyMat, oMat, { x: e.x, y: e.y })
    let _x = pInO.x
    _x = Math.max(0, _x)
    // 宽300, 像素点应该是 0 - 299
    // _x = Math.min(hcvs.value!.width - 1, _x)
    _x = Math.min(hcvs.value!.width, _x)
    return _x
  }
  function oMouseUp(e: MouseEvent) {
    if (!inOpacityMoving) return
    const x = getXInOcvs(e)
    state.a = _toFixed(x / ocvs.value!.width, 2)

    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)
    inOpacityMoving = false
  }
  function oMouseMove(e: MouseEvent) {
    if (!inOpacityMoving) return
    const x = getXInOcvs(e)
    state.a = _toFixed(x / ocvs.value!.width, 2)
    const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
    emitColor(`rgba(${rgb.r},${rgb.g},${rgb.b},${state.a})`)
  }

  watch(
    () => state.hsv,
    (newHsv) => {
      renderHcvs()
      // 计算传入颜色值位置
      const hX = newHsv.h * hcvs.value!.width
      // 画色相定位
      renderHuePoint(hX)
      // 画sv底
      renderSVcvs()
      // 计算 sv 定位
      const svX = newHsv.s * svcvs.value!.width
      const svY = (1 - newHsv.v) * svcvs.value!.height
      renderSVPoint(svX, svY)
      const oX = ocvs.value!.clientWidth * state.a
      renderOcvs(oX)

      if (!firstSet) {
        // 通知外部颜色值修改了
        // const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
        // updateColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.a})`)
      }
      firstSet = false
    },
    { deep: true }
  )
  watch(
    () => state.a,
    (newA, oldA) => {
      // 透明度转横向坐标
      const x = ocvs.value!.width * newA
      // 绘制流程 画底，画坐标
      renderOcvs(x)
      // oldA !== -1 表示不是初始化赋值
      if (oldA !== -1) {
        // 通知外部颜色值修改了
        // const rgb = hsv2rgb(state.hsv.h, state.hsv.s, state.hsv.v)
        // updateColor(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.a})`)
      }
    }
  )

  onMounted(() => {
    // // 计算传入颜色值位置
    // const rgbObj = getRgba(color)
    // if (!rgbObj) throw new Error(`do not support this color: ${color}`)
    // const hsvObj = rgb2hsv(rgbObj!.r, rgbObj!.g, rgbObj!.b)
    // state.hsv = { h: hsvObj.h1, s: hsvObj.s1, v: hsvObj.v1 }
    // // 透明度
    // state.a = rgbObj.a
    // console.log(rgbObj)

    // 全局监听mousemove事件，并计算相对色相条位置
    document.body.addEventListener('mousemove', hueMouseMove)
    // 全局监听mouseup事件，退出拖拽状态
    document.body.addEventListener('mouseup', hueMouseUp)

    document.body.addEventListener('mousemove', svMouseMove)
    document.body.addEventListener('mouseup', svMouseUp)
    document.body.addEventListener('mousemove', oMouseMove)
    document.body.addEventListener('mouseup', oMouseUp)

    const onBoxResize = (e: ResizeObserverEntry[]): void => {
      const { width } = e[0].contentRect
      if (width !== 0) {
        // 强制执行一遍渲染逻辑
        const hsvStr = JSON.stringify(state.hsv)
        state.hsv = { h: -1, s: -1, v: -1 }
        state.hsv = JSON.parse(hsvStr)
      }
    }

    new ResizeObserver(onBoxResize).observe(svcvs.value as Element)
  })
  onUnmounted(() => {})

  function updateColorFromInput(val: string) {
    // 通知当前picker层，颜色修改了
    const rgbObj = getRgba(val)
    if (!rgbObj) return

    const rgbStr = `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${rgbObj.a})`
    const hsvObj = rgb2hsv(rgbObj!.r, rgbObj!.g, rgbObj!.b)
    state.hsv = { h: hsvObj.h1, s: hsvObj.s1, v: hsvObj.v1 }
    // 通知外层颜色修改了
    // updateColor(rgbStr)
    emit('update:color', rgbStr)
  }
</script>

<template>
  <div class="pickerBox">
    <canvas ref="svcvs" class="svCvs" @mousedown="svMouseDown"></canvas>
    <canvas ref="hcvs" class="hCvs" @mousedown="hueMouseDown"></canvas>
    <canvas ref="ocvs" class="oCvs" @mousedown="oMouseDown"></canvas>
    <div class="iptColor">
      <select v-model="colorType" class="colorType" name="colorType">
        <option :value="ColorTypes.hex">HEX</option>
        <option :value="ColorTypes.rgb">RGB</option>
      </select>
      <div class="ipts">
        <hex-input v-if="isHex" :value="hexRef" :update-value="updateColorFromInput"></hex-input>
        <rgb-input v-else :value="color" :update-value="updateColorFromInput"></rgb-input>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .pickerBox {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    // justify-content: center;
    align-items: center;
    row-gap: 10px;
    padding: 5px;
    .svCvs {
      width: 100%;
      height: 150px;
      border-radius: 5px;
    }
    .hCvs {
      width: 100%;
      height: 20px;
      border-radius: 5px;
    }
    .oCvs {
      width: 100%;
      height: 20px;
      border-radius: 5px;
    }
    .iptColor {
      width: 100%;
      display: flex;
      column-gap: 8px;
      align-items: center;
      .colorType {
        font-size: 14px;
        border-radius: 5px;
        border: none;
        outline: none;
        height: 25px;
        // 控制监听与文字的间距
        padding-right: 5px;
      }
      .ipts {
        flex-grow: 1;
        display: flex;
        align-items: center;
      }
    }
  }
</style>
