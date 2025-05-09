<script lang="ts" setup>
  import { ref, watch, reactive, nextTick } from 'vue'
  import colorPicker from '@/components/colorPicker/color-picker.vue'
  import palletMask from '@/views/editer/components/propertyBar/pallet-mask.vue'
  import { useFocusWithin } from '@vueuse/core'
  const open = ref(false)
  // const emit = defineEmits(['update:color'])
  const props = defineProps<{
    color: string
    updateColor: (color: string) => void
  }>()
  const showColor = ref(props.color)
  const anchor = ref<HTMLDivElement>()
  const pickerRef = ref<HTMLDivElement>()

  async function toggleOpen() {
    open.value = true
    await nextTick()
    // 打开是默认聚焦到panel上
    pickerRef.value?.focus()
  }
  //! focus能监听到浏览器以外的点击
  // onClickOutside(pickerRef, () => {
  //   open.value = false
  // })
  const { focused } = useFocusWithin(pickerRef)

  watch(focused, (focus) => {
    if (!focus) {
      open.value = false
    }
  })

  const pickerStyle = reactive({
    left: '0px',
    top: '0px',
    display: 'none'
  })
  watch(open, (newVal) => {
    if (newVal) {
      const rect = anchor.value!.getBoundingClientRect()
      pickerStyle.left = rect.left + 'px'
      pickerStyle.top = rect.top + rect.height + 'px'
      pickerStyle.display = ''
    } else {
      pickerStyle.display = 'none'
    }
  })
  // 组件内部自己消化颜色变化引起的组件内部变化
  // 组件外部通过事件抛出修改后的颜色值
  // function updateColorSelf(color: string) {
  //   showColor.value = color
  //   props.updateColor(color)
  // }

  // props.color 貌似不能作为v-model的值，这里做一次中转
  // todo: 了解为什么
  watch(
    () => props.color,
    (newColor) => {
      showColor.value = newColor
    }
  )

  watch(showColor, (newColor) => {
    props.updateColor(newColor)
  })
</script>

<template>
  <div ref="anchor" class="box" :style="{ background: showColor }" @click="toggleOpen"> </div>
  <Teleport to="body">
    <pallet-mask :style="{ display: pickerStyle.display }">
      <div ref="pickerRef" class="colorPanel" tabindex="0" :style="{ left: pickerStyle.left, top: pickerStyle.top }">
        <color-picker v-model:color="showColor"></color-picker>
      </div>
    </pallet-mask>
  </Teleport>
</template>

<style scoped lang="scss">
  .box {
    width: 30px;
    height: 30px;
  }
  .colorPanel {
    outline: none;
    width: 190px;
    position: absolute;
    z-index: 30;
    border-radius: 5px;
    padding: 10px;
    background-color: antiquewhite;
  }
</style>
