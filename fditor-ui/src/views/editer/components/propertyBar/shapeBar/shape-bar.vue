<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { computed, inject, reactive, toRaw } from 'vue'
  import strokeProperty from '@/views/editer/components/propertyBar/components/stroke-property.vue'
  import fillProperty from '@/views/editer/components/propertyBar/components/fill-property.vue'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { FPath, type colorVal, type Editor } from '@fditor/core'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { color2Instance, colorInstance2Info } from '@/utils/common'
  import type { FabricObject } from 'fabric'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import radiusProperty from '@/views/editer/components/propertyBar/components/radius-property.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import { isShape } from '@/utils/guard'
  import { useAttrModify } from '@/stores/commands/useModifyAttr'
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
    // return Boolean(attrs.stroke.value)
    return attrs.strokeWidth > 0
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

  const { modifyAttr } = useAttrModify()
  function changeColor(obj: FabricObject, type: 'fill' | 'stroke', val: colorVal) {
    //? 第三个参数使用更新前的颜色值，刚好满足需求，因为其值在发生修改前是不变的
    if (type === 'fill') {
      const oldVal = color2Instance(attrs.fill, obj.width, obj.height)
      modifyAttr(obj, { fill: val }, { fill: oldVal }, false)
    } else if (type === 'stroke') {
      const oldVal = color2Instance(attrs.stroke, obj.width, obj.height)
      modifyAttr(obj, { stroke: val }, { stroke: oldVal }, false)
    }
  }

  function updateFill(info: ColorInfo, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    const colorInstance = color2Instance(info, shape.width, shape.height)

    if (commit) {
      changeColor(shape, 'fill', colorInstance)
    } else {
      shape.set('fill', colorInstance)
    }
    editor.render()
  }
  function updateStroke(info: ColorInfo, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    const colorInstance = color2Instance(info, shape.width, shape.height)
    if (commit) {
      changeColor(shape, 'stroke', colorInstance)
    } else {
      shape.set('stroke', colorInstance)
    }
    editor.render()
  }
  function updateDash(_dash: number[]) {
    const shape = editor.stage.getActiveObject()!
    const toAttrs: Partial<FPath> = {}
    if (_dash[0] === -1) {
      // 删除stroke
      // modifyAttr(shape, { strokeDashArray: null, stroke: null, strokeWidth: 0 })
      modifyAttr(shape, { strokeDashArray: null, strokeWidth: 0 })
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
      modifyAttr(shape, toAttrs)
    }
    editor.render()
  }
  function updateStrokeWidth(_strokeWidth: number, { commit }: updateColorOptions) {
    const old = attrs.strokeWidth
    const shape = editor.stage.getActiveObject()!
    if (!isShape(shape)) return
    const toAttrs: Partial<FPath> = {}
    toAttrs.strokeWidth = _strokeWidth
    if (old === 0) {
      toAttrs.strokeDashArray = [0]
      toAttrs.stroke = 'rgba(0,0,0,1)'
    }
    if (_strokeWidth === 0) {
      //todo: 保留上一次的颜色值, 不要恢复成黑色
      // 清理掉stroke
      // toAttrs.stroke = null
      toAttrs.strokeDashArray = [-1]
    }
    if (commit) {
      // stroke需要转换为颜色值
      const oldStroke = color2Instance(attrs.stroke, shape.width, shape.height)
      const oldVal: Partial<FPath> = {
        strokeDashArray: toRaw(attrs.dash),
        stroke: oldStroke,
        strokeWidth: attrs.strokeWidth
      }
      // preview set 会让要设置的值已经设置，强制不检查change
      // shape.eset(toAttrs, false)
      modifyAttr(shape, toAttrs, oldVal, false)
    } else {
      shape.set(toAttrs)
    }
    editor.render()
  }
  function updateRadius(val: number, { commit }: updateColorOptions) {
    console.log(val, commit)
    const shape = editor.stage.getActiveObject()!
    if (!isShape(shape)) return
    if (commit) {
      const oldVal: Partial<FPath> = {
        cornerRadius: attrs.radius
      }
      modifyAttr(shape, { cornerRadius: val }, oldVal, false)
    } else {
      shape.set('cornerRadius', val)
    }
    editor.render()
  }
</script>

<template>
  <div class="figmaShapeBar">
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

<style scoped lang="scss">
  .figmaShapeBar {
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }
</style>
