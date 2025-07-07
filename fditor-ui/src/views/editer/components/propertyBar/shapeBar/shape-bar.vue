<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { computed, inject, reactive } from 'vue'
  import strokeProperty from '@/views/editer/components/propertyBar/stroke-property.vue'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { createLinearGradient, createRadialGradient, type colorVal, type Editor } from '@fditor/core'
  // todo 将core中定义的类型导出
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { colorInstance2Info } from '@/utils/common'
  import type { FabricObjectProps } from 'fabric'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import radiusProperty from '@/views/editer/components/propertyBar/shapeBar/radius-property.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import { isShape } from '@/utils/guard'
  // const props = defineProps<{
  //   foo?: string
  // }>()
  // 每次修改都重新选中当前元素，触发onMounted 获取属性
  // or 修改属性后通知当前组件直接更新
  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()

  interface ShapeAttrs {
    fill: ColorInfo
    stroke: ColorInfo
    strokeWidth: number
    dash: number[]
    width: number
    radius: number
  }
  const attrs: ShapeAttrs = reactive({
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
    width: 0,
    radius: 0
  })
  const showStroke = computed(() => {
    return Boolean(attrs.stroke.value)
  })
  const showRadius = computed(() => {
    if (editorStore.selectType !== 'Shape') return false
    const selected = editor.getActiveObject()!
    if (isShape(selected)) {
      return selected.radiusAble
    }
    return false
  })
  function getAttrs() {
    const shape = editor.stage.getActiveObject()!
    attrs.fill = colorInstance2Info(shape.fill as colorVal)
    attrs.stroke = colorInstance2Info(shape.stroke as colorVal)
    attrs.strokeWidth = shape.strokeWidth ? (shape.strokeWidth ?? 0) : 0
    // -1 表示没有stroke
    attrs.dash = shape.strokeDashArray ? (shape.strokeDashArray ?? [-1]) : [-1]
    attrs.width = shape.width
    attrs.radius = isShape(shape) ? shape.cornerRadius : 0
  }
  // 属性获取目前是在bar上，统一获取，分散到单一组件中，单独获取？
  useGetAttrs(getAttrs)

  function updateFill(info: ColorInfo, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    if (info.type === 'solid') {
      if (commit) {
        shape.eset('fill', info.value, false)
      } else {
        shape.set('fill', info.value)
      }
    } else if (info.type === 'gradient') {
      // 渐变，获取宽高后，重新设置其coords
      const gradientInfo = info.value
      if (gradientInfo.type === 'linear') {
        const gradient = createLinearGradient(
          'pixels',
          gradientInfo.degree,
          shape.width,
          shape.height,
          ...gradientInfo.colors
        )
        if (commit) {
          shape.eset('fill', gradient, false)
        } else {
          shape.set('fill', gradient)
        }
      } else if (gradientInfo.type === 'radial') {
        const gradient = createRadialGradient(
          'pixels',
          gradientInfo.percent,
          shape.width,
          shape.height,
          ...gradientInfo.colors
        )
        if (commit) {
          shape.eset('fill', gradient, false)
        } else {
          shape.set('fill', gradient)
        }
      }
    }
    editor.render()
  }
  function updateStroke(info: ColorInfo, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    if (info.type === 'solid') {
      if (commit) {
        shape.eset('stroke', info.value, false)
      } else {
        shape.set('stroke', info.value)
      }
    } else if (info.type === 'gradient') {
      // 渐变，获取宽高后，重新设置其coords
      const gradientInfo = info.value
      if (gradientInfo.type === 'linear') {
        const gradient = createLinearGradient(
          'pixels',
          gradientInfo.degree,
          shape.width,
          shape.height,
          ...gradientInfo.colors
        )
        if (commit) {
          shape.eset('stroke', gradient, false)
        } else {
          shape.set('stroke', gradient)
        }
      } else if (gradientInfo.type === 'radial') {
        const gradient = createRadialGradient(
          'pixels',
          gradientInfo.percent,
          shape.width,
          shape.height,
          ...gradientInfo.colors
        )
        if (commit) {
          shape.eset('stroke', gradient, false)
        } else {
          shape.set('stroke', gradient)
        }
      }
    }
    editor.render()
  }
  function updateDash(_dash: number[]) {
    const shape = editor.stage.getActiveObject()!
    const toAttrs: Partial<FabricObjectProps> = {}
    if (_dash[0] === -1) {
      // 删除stroke
      toAttrs.strokeDashArray = null
      toAttrs.stroke = null
      toAttrs.strokeWidth = 0
    } else {
      toAttrs.strokeDashArray = _dash
      if (!shape.stroke) {
        toAttrs.stroke = 'rgba(0,0,0,1)'
      }
      if (!shape.strokeWidth) {
        // 限制最小值
        const w = Math.min(shape.width / 2, 2)
        toAttrs.strokeWidth = w
      }
    }
    shape.eset(toAttrs)
    editor.render()
  }
  function updateStrokeWidth(_strokeWidth: number, { commit }: updateColorOptions) {
    console.log(commit)
    const old = attrs.strokeWidth
    const shape = editor.stage.getActiveObject()!
    const toAttrs: Partial<FabricObjectProps> = {}
    toAttrs.strokeWidth = _strokeWidth
    if (old === 0) {
      toAttrs.strokeDashArray = [0]
      toAttrs.stroke = 'rgba(0,0,0,1)'
    }
    if (_strokeWidth === 0) {
      //todo: 保留上一次的颜色值, 不要恢复成黑色
      // 清理掉stroke
      toAttrs.stroke = null
      toAttrs.strokeDashArray = [-1]
    }
    if (commit) {
      // preview set 会让要设置的值已经设置，强制不检查change
      shape.eset(toAttrs, false)
    } else {
      shape.set(toAttrs)
    }
    editor.render()
  }
  function updateRadius(val: number, { commit }: updateColorOptions) {
    console.log(val, commit)
    const shape = editor.stage.getActiveObject()!
    if (commit) {
      shape.eset('cornerRadius', val, false)
    } else {
      shape.set('cornerRadius', val)
    }
    editor.render()
  }
</script>

<template>
  <div class="typeBar">
    <fill-property :color="attrs.fill" tip="fill" @update:color="updateFill"></fill-property>
    <fill-property
      v-if="showStroke"
      v-model:color="attrs.stroke"
      tip="stroke"
      @update:color="updateStroke"
    ></fill-property>
    <stroke-property
      :dash="attrs.dash"
      :stroke-width="attrs.strokeWidth"
      :max-width="attrs.width"
      tip="stroke style"
      @update:dash="updateDash"
      @update:stroke-width="updateStrokeWidth"
    ></stroke-property>
    <radius-property v-if="showRadius" :radius="attrs.radius" @update:radius="updateRadius"></radius-property>
  </div>
</template>

<style scoped lang="scss"></style>
