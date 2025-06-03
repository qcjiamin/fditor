<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { computed, inject, reactive } from 'vue'
  import { useEditorStore } from '@/stores/editorStore'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import { EditorKey } from '@/constants/injectKey'
  import { createLinearGradient, createRadialGradient, type colorVal, type Editor } from '@kditor/core'
  import { colorInstance2Info } from '@/utils/common'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { Textbox } from 'fabric'
  import FontBold from '@/assets/icons/fontbar/font_bold.svg'
  import FontItalic from '@/assets/icons/fontbar/font_italic.svg'
  import FontUnderline from '@/assets/icons/fontbar/font_underline.svg'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import alignProperty from '@/views/editer/components/propertyBar/textBar/align-property.vue'
  import type { alignType } from '@/views/editer/components/propertyBar/textBar/types'

  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const selected = editorStore.selected
  const fontFamilyList = ['abc', 'def', 'hik', 'era']

  type FontWeight = 'normal' | 'bold'
  type FontStyle = 'normal' | 'italic'

  interface IFontAttrs {
    fill: ColorInfo
    fontfamily: string
    fontsize: number
    fontWeight: FontWeight
    fontStyle: FontStyle
    underline: boolean
    align: alignType
  }
  const attrs: IFontAttrs = reactive({
    fill: {
      type: 'solid',
      value: 'rgba(255,255,255,1)'
    },
    fontfamily: '',
    fontsize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    underline: false,
    align: 'left'
  })
  const isBold = computed(() => {
    return attrs.fontWeight === 'bold'
  })
  const isItalic = computed(() => {
    return attrs.fontStyle === 'italic'
  })

  function getAttrs() {
    console.log('get font attr')
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    attrs.fill = colorInstance2Info(selected.fill as colorVal)
    attrs.fontfamily = 'abc'
    console.error(selected.fontSize)
    attrs.fontsize = selected.fontSize
    attrs.fontWeight = selected.fontWeight as FontWeight
    attrs.fontStyle = selected.fontStyle as FontStyle
    attrs.underline = selected.underline
    attrs.align = selected.textAlign as alignType
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
  function updateFontWeight() {
    //todo: 封装检查选中元素的逻辑，抛出错误
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    selected.eset('fontWeight', selected.fontWeight === 'normal' ? 'bold' : 'normal', false)
  }
  function updateFontStyle() {
    //todo: 封装检查选中元素的逻辑，抛出错误
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    selected.eset('fontStyle', selected.fontStyle === 'normal' ? 'italic' : 'normal', false)
  }
  function updateUnderline() {
    //todo: 封装检查选中元素的逻辑，抛出错误
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    selected.eset('underline', !attrs.underline, false)
  }
  function updateAlign(val: alignType) {
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    selected.eset('textAlign', val, false)
  }
</script>

<template>
  <div class="typeBar">
    <el-select :model-value="attrs.fontfamily" placeholder="" size="default" style="width: 240px">
      <el-option v-for="item in fontFamilyList" :key="item" :label="item" :value="item" />
    </el-select>
    <el-input-number :model-value="attrs.fontsize" :min="10" size="small" @change="updateFontsize" />
    <fill-property :color="attrs.fill" tip="font color" @update:color="updateFill"></fill-property>
    <property-normal-item :active="isBold" @click="updateFontWeight">
      <FontBold></FontBold>
    </property-normal-item>
    <property-normal-item :active="isItalic" @click="updateFontStyle">
      <FontItalic></FontItalic>
    </property-normal-item>
    <property-normal-item :active="attrs.underline" @click="updateUnderline">
      <FontUnderline></FontUnderline>
    </property-normal-item>
    <align-property :align="attrs.align" @update:align="updateAlign"></align-property>
    <div>间距</div>
  </div>
</template>

<style scoped lang="scss">
  .typeBar {
    :deep(.el-select) {
      width: 120px !important;
    }
    :deep(.el-select__wrapper) {
      min-height: 30px;
    }
    // 字号输入框
    :deep(.el-input-number--small) {
      width: 100px;
    }
    :deep(.el-input) {
      height: 30px;
    }
  }
</style>
