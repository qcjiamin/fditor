<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import type { colorVal, Editor } from '@fditor/core'
  import { inject, reactive } from 'vue'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import type { IPathAttrs } from '@/views/editer/components/propertyBar/pathBar/type'
  import { Path } from 'fabric'
  import { colorInstance2Info } from '@/utils/common'
  import sliderProperty from '@/views/editer/components/propertyBar/components/slider-property.vue'
  import lineWidthIcon from '@/assets/icons/pencilbar/lineWidth.svg'
  import fillProperty from '@/views/editer/components/propertyBar/components/fill-property.vue'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import radiusProperty from '@/views/editer/components/propertyBar/components/radius-property.vue'

  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  const selected = editorStore.selected

  const attrs: IPathAttrs = reactive({
    strokeColor: {
      type: 'solid',
      value: 'rgba(0,0,0,1)'
    },
    strokeWidth: 15,
    radius: 0
  })
  function getAttrs() {
    console.log('get font attr')
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Path)) throw new Error('get attr but is not textbox')
    attrs.strokeColor = colorInstance2Info(selected.stroke as colorVal)
    attrs.strokeWidth = selected.strokeWidth ? (selected.strokeWidth ?? 0) : 0
    attrs.radius = selected.cornerRadius ?? 0
  }
  useGetAttrs(getAttrs)

  function updateStrokeWidth(value: number, { commit }: updateColorOptions) {
    if (!selected) throw new Error('update path color but no selected')
    if (commit) {
      selected.eset('strokeWidth', value, false)
    } else {
      selected.set('strokeWidth', value)
      editor.render()
    }
  }
  function updateStrokeColor(info: ColorInfo, { commit }: updateColorOptions) {
    if (!selected) throw new Error('update path color but no selected')
    if (info.type === 'solid') {
      if (commit) {
        selected.eset('stroke', info.value, false)
      } else {
        selected.set('stroke', info.value)
      }
    }
    editor.render()
  }

  function updateRadius(val: number, { commit }: updateColorOptions) {
    console.log(val, commit)
    const path = editor.stage.getActiveObject()!
    if (commit) {
      path.eset('cornerRadius', val, false)
    } else {
      path.set('cornerRadius', val)
    }
    editor.render()
  }
</script>

<template>
  <div class="typeBar">
    <fill-property
      :color="attrs.strokeColor"
      :enable-gradient="false"
      tip="stroke color"
      @update:color="updateStrokeColor"
    ></fill-property>
    <slider-property
      :model-value="attrs.strokeWidth"
      tip="stroke width"
      :min="1"
      :max="100"
      :step="1"
      @change="updateStrokeWidth"
    >
      <template #icon>
        <lineWidthIcon></lineWidthIcon>
      </template>
    </slider-property>
    <radius-property :radius="attrs.radius" @update:radius="updateRadius"></radius-property>
  </div>
</template>

<style scoped lang="scss">
  .typeBar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
