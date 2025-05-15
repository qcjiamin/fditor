<script lang="ts" setup generic="T extends GradientType">
  import { onBeforeMount, reactive, watch } from 'vue'
  // import type { GradientTypes } from '@/utils/types'
  import linearA from '@/assets/icons/gradient/linear90.svg'
  import linearB from '@/assets/icons/gradient/linear180.svg'
  import linearC from '@/assets/icons/gradient/linear135.svg'
  import radialB from '@/assets/icons/gradient/radial0.svg'
  import radialA from '@/assets/icons/gradient/radial50.svg'
  import type { GradientOption } from '@/views/editer/components/propertyBar/types'
  import type { GradientType } from 'fabric'
  import type { GradientTypes } from '@/utils/types'
  import transparentIcon from '@/assets/transparent.svg'
  import colorPicker from '@/components/colorPicker/color-picker.vue'

  // 外部直接修改渐变色的情况？暂时应该没有
  const props = defineProps<{
    color: GradientOption<T>
  }>()
  const emit = defineEmits(['update:color'])

  type GradientPickerState = {
    style: GradientTypes
    colors: string[]
    // 选中了第几个颜色
    colorIdx: number
  }

  const status: GradientPickerState = reactive({
    style: 'linear90',
    colors: ['reba(255,255,255,1)', 'reba(0,0,0,1)'],
    // 选中了第几个颜色
    colorIdx: 0
  })

  onBeforeMount(() => {
    console.log(props.color)
    if (props.color.type === 'linear') {
      status.style = `${props.color.type}${props.color.degree}` as GradientTypes
    } else if (props.color.type === 'radial') {
      status.style = `${props.color.type}${props.color.percent * 100}` as GradientTypes
    }
    status.colors = JSON.parse(JSON.stringify(props.color.colors))
  })

  function getTypeFromStyle(style: GradientTypes): GradientType {
    if (style.includes('linear')) {
      return 'linear'
    } else {
      return 'radial'
    }
  }
  function getValFromStyle(style: GradientTypes) {
    const nums = style.match(/\d+/)
    const num = Number(nums![0])
    const type = getTypeFromStyle(style)
    if (type === 'linear') {
      return num
    } else if (type === 'radial') {
      return num / 100
    }
  }

  watch(
    status,
    () => {
      let colorInfo = null
      const type = getTypeFromStyle(status.style)
      // 重新拼装color，然后返回
      if (type === 'linear') {
        colorInfo = {
          type: 'linear',
          units: props.color.units,
          colors: status.colors,
          degree: getValFromStyle(status.style)
        }
      } else if (type === 'radial') {
        colorInfo = {
          type: 'radial',
          units: props.color.units,
          colors: status.colors,
          percent: getValFromStyle(status.style)
        }
      }
      emit('update:color', colorInfo)
    },
    { deep: true }
  )

  function selectColorStop(idx: number) {
    status.colorIdx = idx
  }
</script>

<template>
  <div>
    <div class="colors">
      <div class="area">
        <p>风格</p>
        <div>
          <el-radio-group v-model="status.style" size="large" fill="#6cf">
            <el-radio-button label="linear90" value="linear90" size="small"><linearA></linearA></el-radio-button>
            <el-radio-button label="linear180" value="linear180" size="small"><linearB></linearB></el-radio-button>
            <el-radio-button label="linear135" value="linear135" size="small"><linearC></linearC></el-radio-button>
            <el-radio-button label="radial50" value="radial50" size="small"><radialA></radialA></el-radio-button>
            <el-radio-button label="radial0" value="radial0" size="small"><radialB></radialB></el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="area">
        <p>渐变色</p>
        <div class="colorstops">
          <div
            v-for="(_color, index) in status.colors"
            :key="index"
            class="anchor"
            :class="{ active: index === status.colorIdx }"
            @click="selectColorStop(index)"
          >
            <transparentIcon class="child"></transparentIcon>
            <div class="child" :style="{ background: _color }"></div>
          </div>
        </div>
      </div>
      <div class="area">
        <color-picker v-model:color="status.colors[status.colorIdx]"></color-picker>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .colorstops {
    display: flex;
    column-gap: 5px;
    .anchor {
      width: 30px;
      height: 30px;
      position: relative;
      border-radius: 5px;
      overflow: hidden;
      &.active {
        border: 2px solid rgb(42, 133, 185);
      }
      .child {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      }
    }
  }
</style>
