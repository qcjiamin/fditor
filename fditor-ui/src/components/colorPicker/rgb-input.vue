<script lang="ts" setup>
  import { getRgba } from '@/components/colorPicker/color'
  import { computed, onMounted, reactive, ref } from 'vue'

  // const emit = defineEmits(['tabChange'])
  const props = defineProps<{
    value: string
    updateValue: (val: string) => void
  }>()
  const boxRef = ref<HTMLDivElement>()

  const rgb = computed(() => {
    console.log(props.value)
    const obj = getRgba(props.value)
    console.log(obj)
    return {
      r: obj?.r,
      g: obj?.g,
      b: obj?.b
    }
  })
  const r = ref<HTMLInputElement>()
  const g = ref<HTMLInputElement>()
  const b = ref<HTMLInputElement>()

  function inputHandle(e: Event) {
    const input = e.target as HTMLInputElement
    let val = parseInt(input.value)

    if (isNaN(val)) val = 0
    if (val < 0) val = 0
    if (val > 255) val = 255

    input.value = val.toString()
  }

  function changeHandle() {
    props.updateValue(`rgb(${r.value?.value}, ${g.value?.value}, ${b.value?.value})`)
  }

  const iptStyle = reactive({
    width: '5px'
  })

  onMounted(() => {
    const onBoxResize = (e: ResizeObserverEntry[]): void => {
      const { width } = e[0].contentRect
      if (width !== 0) {
        const gap = 7
        const iptWidth = (width - 2 * gap) / 3
        iptStyle.width = iptWidth + 'px'
      }
    }

    new ResizeObserver(onBoxResize).observe(boxRef.value as Element)
  })
</script>

<template>
  <div ref="boxRef" class="rgbbox">
    <input
      ref="r"
      type="number"
      min="0"
      max="255"
      step="1"
      :value="rgb.r"
      :style="iptStyle"
      @input="inputHandle"
      @change="changeHandle"
    />
    <input
      ref="g"
      type="number"
      min="0"
      max="255"
      step="1"
      :value="rgb.g"
      :style="iptStyle"
      @input="inputHandle"
      @change="changeHandle"
    />
    <input
      ref="b"
      type="number"
      min="0"
      max="255"
      step="1"
      :value="rgb.b"
      :style="iptStyle"
      @input="inputHandle"
      @change="changeHandle"
    />
  </div>
</template>

<style scoped lang="scss">
  /* Chrome, Safari, Edge, Opera */
  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }

  .rgbbox {
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 32px;
    column-gap: 7px;
    overflow: hidden;

    input {
      flex-shrink: 1;
      min-width: 10px;
      font-size: 13px;
      text-align: center;
      border-radius: 6px;
      outline: none;
      border: 1px solid #e0e0e0;
      background-color: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      &:hover {
        border-color: #d0d0d0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }
</style>
