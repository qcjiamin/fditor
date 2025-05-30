<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { inject, reactive } from 'vue'
  import { useEditorStore } from '@/stores/editorStore'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import { EditorKey } from '@/constants/injectKey'
  import { createLinearGradient, createRadialGradient, type colorVal, type Editor } from '@kditor/core'
  import { colorInstance2Info } from '@/utils/common'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const selected = editorStore.selected

  interface IFontAttrs {
    fill: ColorInfo
    stroke: ColorInfo
    strokeWidth: number
    dash: number[]
    width: number
  }
  const attrs: Partial<IFontAttrs> = reactive({
    fill: {
      type: 'solid',
      value: 'rgba(255,255,255,1)'
    }
  })

  function getAttrs() {
    if (!selected) throw new Error('get font color but no selected')
    attrs.fill = colorInstance2Info(selected.fill as colorVal)
  }
  useGetAttrs(getAttrs)

  function updateFill(info: ColorInfo, { commit }: updateColorOptions) {
    if (!selected) throw new Error('update font color but no selected')
    if (info.type === 'solid') {
      if (commit) {
        selected.eset('fill', info.value, false)
      } else {
        selected.set('fill', info.value)
      }
    } else if (info.type === 'gradient') {
      // 渐变，获取宽高后，重新设置其coords
      const gradientInfo = info.value
      if (gradientInfo.type === 'linear') {
        const gradient = createLinearGradient(
          'pixels',
          gradientInfo.degree,
          selected.width,
          selected.height,
          ...gradientInfo.colors
        )
        if (commit) {
          selected.eset('fill', gradient, false)
        } else {
          selected.set('fill', gradient)
        }
      } else if (gradientInfo.type === 'radial') {
        const gradient = createRadialGradient(
          'pixels',
          gradientInfo.percent,
          selected.width,
          selected.height,
          ...gradientInfo.colors
        )
        if (commit) {
          selected.eset('fill', gradient, false)
        } else {
          selected.set('fill', gradient)
        }
      }
    }
    editor.render()
  }
</script>

<template>
  <div class="typeBar">
    <div>字体</div>
    <div>字号</div>
    <fill-property :color="attrs.fill" tip="font color" @update:color="updateFill"></fill-property>
    <div>B</div>
    <div>I</div>
    <div>align</div>
    <div>间距</div>
  </div>
</template>

<style scoped lang="scss"></style>
