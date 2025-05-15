<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { computed, inject, reactive, watch } from 'vue'
  import strokeProperty from '@/views/editer/components/propertyBar/stroke-property.vue'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { createLinearGradient, createRadialGradient, type Editor } from '@kditor/core'
  // todo 将core中定义的类型导出
  import type { colorVal } from '../../../../../../../packages/core/types'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { colorInstance2Info } from '@/utils/common'

  // const props = defineProps<{
  //   foo?: string
  // }>()
  // 每次修改都重新选中当前元素，触发onMounted 获取属性
  // or 修改属性后通知当前组件直接更新
  const editor = inject(EditorKey) as Editor
  // const selectedRef = inject(selectedKey)

  interface ShapeAttrs {
    // fill: konvaFill
    fill: ColorInfo
    stroke: ColorInfo
    strokeWidth: number
    dash: number[]
    width: number
  }
  const state: ShapeAttrs = reactive({
    fill: {
      type: 'solid',
      value: 'rgba(255,255,255,1)'
    },
    stroke: {
      type: 'solid',
      value: null
    },
    strokeWidth: 0,
    dash: [-1],
    width: 0
  })
  const showStroke = computed(() => {
    return state.stroke.value
  })
  function getAttrs() {
    const shape = editor.stage.getActiveObject()!
    state.fill = colorInstance2Info(shape.fill as colorVal)
    state.stroke = colorInstance2Info(shape.stroke as colorVal)
    state.strokeWidth = shape.strokeWidth ? (shape.strokeWidth ?? 0) : 0
    // -1 表示没有stroke
    state.dash = shape.strokeDashArray ? (shape.strokeDashArray ?? [-1]) : [-1]
    state.width = shape.width
  }
  // 属性获取目前是在bar上，统一获取，分散到单一组件中，单独获取？
  useGetAttrs(getAttrs)

  // fill
  watch(
    () => state.fill,
    (info) => {
      console.log('change fill')
      const shape = editor.stage.getActiveObject()!
      if (info.type === 'solid') {
        shape.eset('fill', info.value)
      } else if (info.type === 'gradient') {
        // 渐变，获取宽高后，重新设置其coords
        const gradientInfo = info.value
        if (gradientInfo.type === 'linear') {
          const gradient = createLinearGradient(
            'pixels',
            gradientInfo.degree,
            editor.workspace.width,
            editor.workspace.height,
            ...gradientInfo.colors
          )
          shape.eset('fill', gradient)
        } else if (gradientInfo.type === 'radial') {
          const gradient = createRadialGradient(
            'pixels',
            gradientInfo.percent,
            editor.workspace.width,
            editor.workspace.height,
            ...gradientInfo.colors
          )
          shape.eset('fill', gradient)
        }
      }
      editor.render()
    },
    { deep: true }
  )
  // stroke
  watch(
    () => state.stroke,
    (info) => {
      console.log('change stroke')
      const shape = editor.stage.getActiveObject()!
      if (info.type === 'solid') {
        shape.set('stroke', info.value)
      } else if (info.type === 'gradient') {
        // 渐变，获取宽高后，重新设置其coords
        const gradientInfo = info.value
        if (gradientInfo.type === 'linear') {
          const gradient = createLinearGradient(
            'pixels',
            gradientInfo.degree,
            editor.workspace.width,
            editor.workspace.height,
            ...gradientInfo.colors
          )
          shape.set('stroke', gradient)
        } else if (gradientInfo.type === 'radial') {
          const gradient = createRadialGradient(
            'pixels',
            gradientInfo.percent,
            editor.workspace.width,
            editor.workspace.height,
            ...gradientInfo.colors
          )
          shape.set('stroke', gradient)
        }
      }
      editor.render()
    },
    { deep: true }
  )
  // dash
  watch(
    () => state.dash,
    (_dash) => {
      const shape = editor.stage.getActiveObject()!
      if (_dash[0] === -1) {
        // 删除stroke
        shape.strokeDashArray = null
        state.stroke = {
          type: 'solid',
          value: null
        }
        state.strokeWidth = 0
      } else {
        shape.strokeDashArray = _dash
        if (!shape.stroke) {
          state.stroke = {
            type: 'solid',
            value: 'rgba(0,0,0,1)'
          }
        }
        if (!shape.strokeWidth) {
          // 限制最小值
          const w = Math.min(shape.width / 2, 2)
          state.strokeWidth = w
        }
      }
      shape.dirty = true
      editor.render()
    }
  )
  // strokeWidth
  watch(
    () => state.strokeWidth,
    (_strokeWidth, old) => {
      const shape = editor.stage.getActiveObject()!
      shape.strokeWidth = _strokeWidth
      if (old === 0) {
        state.dash = [0]
      }
      if (_strokeWidth === 0) {
        //todo: 保留上一次的颜色值, 不要恢复成黑色
        // 清理掉stroke
        state.stroke = {
          type: 'solid',
          value: null
        }
        state.dash = [-1]
      }
      shape.dirty = true
      editor.render()
    }
  )
</script>

<template>
  <div class="typeBar">
    <fill-property v-model:color="state.fill"></fill-property>
    <fill-property v-if="showStroke" v-model:color="state.stroke"></fill-property>
    <stroke-property
      v-model:dash="state.dash"
      v-model:stroke-width="state.strokeWidth"
      :max-width="state.width"
    ></stroke-property>
  </div>
</template>

<style scoped lang="scss"></style>
