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
  import { Textbox } from 'fabric'
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const selected = editorStore.selected
  const fontFamilyList = ['abc', 'def', 'hik', 'era']

  interface IFontAttrs {
    fill: ColorInfo
    fontfamily: string
    fontsize: number
  }
  const attrs: Partial<IFontAttrs> = reactive({
    fill: {
      type: 'solid',
      value: 'rgba(255,255,255,1)'
    },
    fontfamily: '',
    fontsize: 10
  })

  function getAttrs() {
    console.log('get font attr')
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    attrs.fill = colorInstance2Info(selected.fill as colorVal)
    attrs.fontfamily = 'abc'
    console.error(selected.fontSize)
    attrs.fontsize = selected.fontSize
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
  function updateFontsize(val: number | undefined) {
    if (val === undefined) throw Error('update fontsize but value === undefined')
    if (!selected) throw new Error('update fontsize but no selected')
    selected.eset('fontSize', val, false)
    editor.render()
  }
</script>

<template>
  <div class="typeBar">
    <el-select :model-value="attrs.fontfamily" placeholder="" size="default" style="width: 240px">
      <el-option v-for="item in fontFamilyList" :key="item" :label="item" :value="item" />
    </el-select>
    <el-input-number :model-value="attrs.fontsize" :min="10" @change="updateFontsize" />
    <fill-property :color="attrs.fill" tip="font color" @update:color="updateFill"></fill-property>
    <div>B</div>
    <div>I</div>
    <div>align</div>
    <div>间距</div>
  </div>
</template>

<style scoped lang="scss"></style>
