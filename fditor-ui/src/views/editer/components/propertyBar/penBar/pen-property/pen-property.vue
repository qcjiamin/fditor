<script lang="ts" setup>
  import fillProperty from '@/views/editer/components/propertyBar/components/fill-property.vue'
  import sliderProperty from '@/views/editer/components/propertyBar/components/slider-property.vue'
  import { EditorKey } from '@/constants/injectKey'
  import { computed, inject, onMounted, ref, watch } from 'vue'
  import type { Editor } from '@fditor/core'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import lineWidthIcon from '@/assets/icons/pencilbar/lineWidth.svg'
  const editor = inject(EditorKey) as Editor
  const stroke = ref<string>('rgba(0, 0, 0, 1)')
  const strokeWidth = ref<number>(2)

  const strokeInfo = computed<ColorInfo>(() => {
    return {
      type: 'solid',
      value: stroke.value
    }
  })
  onMounted(() => {
    console.error('pen-property mounted')
    //! 利用组件渲染是异步的特点，等组件渲染后再去获取钢笔工具的样式数据
    if (!editor.stage.pen) return
    const pen = editor.stage.pen
    stroke.value = pen.color
    strokeWidth.value = pen.width
  })
  function setStroke(info: ColorInfo, { commit }: updateColorOptions) {
    if (!editor.stage.pen) return
    if (info.type === 'solid') {
      if (!info.value) throw new Error('color null')
      stroke.value = info.value
      if (commit) {
        editor.stage.pen.color = info.value
        //todo: 通知外层颜色修改了, 与history关联
      }
    }
  }
  function setStrokeWidth(val: number, { commit }: updateColorOptions) {
    if (!editor.stage.pen) return
    strokeWidth.value = val
    if (commit) {
      editor.stage.pen.width = val
    }
  }

  watch(
    () => strokeInfo.value,
    (val) => {
      if (!editor.stage.pen) return
      editor.stage.pen.color = val.value as string
    }
  )
  watch(
    () => strokeWidth.value,
    (val) => {
      if (!editor.stage.pen) return
      editor.stage.pen.width = val
    }
  )
</script>

<template>
  <div class="box">
    <fill-property :color="strokeInfo" :enable-gradient="false" @update:color="setStroke"></fill-property>
    <slider-property
      :model-value="strokeWidth"
      :tip="'lineWidth'"
      :min="1"
      :max="100"
      :step="1"
      @change="setStrokeWidth"
    >
      <template #icon>
        <lineWidthIcon></lineWidthIcon>
      </template>
    </slider-property>
  </div>
</template>

<style scoped lang="scss">
  .box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }
</style>
