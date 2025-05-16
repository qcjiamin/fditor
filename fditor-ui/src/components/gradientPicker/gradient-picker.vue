<script lang="ts" setup generic="T extends GradientType">
  import { computed, reactive } from 'vue'
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
    // 选中了第几个颜色
    colorIdx: number
  }

  const status: GradientPickerState = reactive({
    colorIdx: 0
  })

  const gradientType = computed<GradientTypes>(() => {
    if (props.color.type === 'linear') {
      return `${props.color.type}${props.color.degree}` as GradientTypes
    } else if (props.color.type === 'radial') {
      return `${props.color.type}${props.color.percent * 100}` as GradientTypes
    }
    return 'linear90'
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

  function selectColorStop(idx: number) {
    status.colorIdx = idx
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateType(_type: any) {
    const type = getTypeFromStyle(_type as GradientTypes)
    const num = getValFromStyle(_type as GradientTypes)

    emit('update:color', {
      type,
      units: props.color.units,
      colors: props.color.colors,
      [type === 'linear' ? 'degree' : 'percent']: num
    })
  }
  function updateColor(color: string) {
    const colors = JSON.parse(JSON.stringify(props.color.colors))
    colors[status.colorIdx] = color
    emit('update:color', {
      ...props.color,
      colors
    })
  }
</script>

<template>
  <div>
    <div class="colors">
      <div class="area">
        <p>风格</p>
        <div>
          <el-radio-group :model-value="gradientType" size="large" fill="#6cf" @update:model-value="updateType">
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
            v-for="(_color, index) in props.color.colors"
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
        <color-picker :color="props.color.colors[status.colorIdx]" @update:color="updateColor"></color-picker>
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
