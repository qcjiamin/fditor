<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { computed, inject, reactive } from 'vue'
  import { useEditorStore } from '@/stores/editorStore'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import { EditorKey } from '@/constants/injectKey'
  import { createLinearGradient, createRadialGradient, type colorVal, type Editor } from '@fditor/core'
  import { colorInstance2Info, loadFont } from '@/utils/common'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { Textbox } from 'fabric'
  import FontBold from '@/assets/icons/fontbar/font_bold.svg'
  import FontItalic from '@/assets/icons/fontbar/font_italic.svg'
  import FontUnderline from '@/assets/icons/fontbar/font_underline.svg'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import alignProperty from '@/views/editer/components/propertyBar/textBar/align-property.vue'
  import type { alignType } from '@/views/editer/components/propertyBar/textBar/types'
  import spacingProperty from '@/views/editer/components/propertyBar/textBar/spacing-property.vue'
  import type { FontFamilyName, FontStyle, SubFontFamilyInfo } from '@/utils/types'
  import { canFontBeBold, canFontBeItalic, getBoldFont, getRegularFont } from '@/utils/fontFamilyHelper'
  import { fontWeightMap, FontWeightReverseMap } from '@/utils/constants'

  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor
  const selected = editorStore.selected

  interface IFontAttrs {
    fill: ColorInfo
    fontfamily: string
    fontsize: number
    fontWeight: number
    fontStyle: FontStyle
    underline: boolean
    align: alignType
    charSpacing: number
    lineHeight: number
  }
  const attrs: IFontAttrs = reactive({
    fill: {
      type: 'solid',
      value: 'rgba(255,255,255,1)'
    },
    fontfamily: '',
    fontsize: 10,
    fontWeight: 400,
    fontStyle: 'normal',
    underline: false,
    align: 'left',
    // 1/1000 em
    charSpacing: 0,
    lineHeight: 1
  })
  const isBold = computed(() => {
    return attrs.fontWeight > 400
  })
  const canBold = computed(() => {
    return canFontBeBold(attrs.fontfamily as FontFamilyName, attrs.fontStyle)
  })
  const isItalic = computed(() => {
    return attrs.fontStyle === 'italic'
  })
  const canItalic = computed(() => {
    return canFontBeItalic(attrs.fontfamily as FontFamilyName, FontWeightReverseMap[attrs.fontWeight])
  })
  const openFontsTab = computed(() => {
    return editorStore.sidebarShowTab === 'fonts'
  })

  function getAttrs() {
    console.log('get font attr')
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    attrs.fill = colorInstance2Info(selected.fill as colorVal)
    attrs.fontfamily = selected.fontFamily
    attrs.fontsize = selected.fontSize
    attrs.fontWeight = selected.fontWeight as number
    attrs.fontStyle = selected.fontStyle as FontStyle
    attrs.underline = selected.underline
    attrs.align = selected.textAlign as alignType
    attrs.charSpacing = selected.charSpacing
    attrs.lineHeight = selected.lineHeight
  }
  useGetAttrs(getAttrs)

  /** 切换字体侧边栏开关状态 */
  function toggleFontsTab() {
    if (editorStore.sidebarShowTab !== 'resource') {
      editorStore.setSidebarShowTab('resource')
    } else {
      editorStore.setSidebarShowTab('fonts')
    }
  }

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
  async function updateFontWeight() {
    //todo: 封装检查选中元素的逻辑，抛出错误
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    // 通知切换字体
    // 加载字体
    let loadInfo: SubFontFamilyInfo | null = null
    if (attrs.fontWeight > 400) {
      loadInfo = getRegularFont(attrs.fontfamily as FontFamilyName, attrs.fontStyle)
    } else {
      loadInfo = getBoldFont(attrs.fontfamily as FontFamilyName, attrs.fontStyle)
    }
    if (!loadInfo) return
    await loadFont(attrs.fontfamily, loadInfo.fileName, loadInfo.weight, loadInfo.style)

    // 设置weight
    selected.eset('fontWeight', fontWeightMap[loadInfo.weight], false)
  }
  function updateFontStyle() {
    //todo: 封装检查选中元素的逻辑，抛出错误
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    // 通知切换字体
    // 加载字体
    // 设置style
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
  function updateCharSpacing(val: number, { commit }: updateColorOptions) {
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    if (commit) {
      selected.eset('charSpacing', val, false)
    } else {
      selected.set('charSpacing', val)
      editor.render()
    }
  }
  function updateLineHeight(val: number, { commit }: updateColorOptions) {
    console.log(val)
    if (!selected) throw new Error('get font color but no selected')
    if (!(selected instanceof Textbox)) throw new Error('get attr but is not textbox')
    if (commit) {
      selected.eset('lineHeight', val, false)
    } else {
      selected.set('lineHeight', val)
      editor.render()
    }
  }
</script>

<template>
  <div class="typeBar">
    <!-- <el-select :model-value="attrs.fontfamily" placeholder="" size="default" style="width: 240px">
      <el-option v-for="item in fontFamilyList" :key="item" :label="item" :value="item" />
    </el-select> -->
    <property-normal-item tip="fontfamily" :active="openFontsTab" @click="toggleFontsTab">
      {{ attrs.fontfamily }}
    </property-normal-item>
    <el-input-number :model-value="attrs.fontsize" :min="10" size="small" @change="updateFontsize" />
    <fill-property :color="attrs.fill" tip="font color" @update:color="updateFill"></fill-property>
    <property-normal-item :active="isBold" :disable="!canBold" @click="updateFontWeight">
      <FontBold></FontBold>
    </property-normal-item>
    <property-normal-item :active="isItalic" :disable="!canItalic" @click="updateFontStyle">
      <FontItalic></FontItalic>
    </property-normal-item>
    <property-normal-item :active="attrs.underline" @click="updateUnderline">
      <FontUnderline></FontUnderline>
    </property-normal-item>
    <align-property :align="attrs.align" tip="alignment" @update:align="updateAlign"></align-property>
    <spacing-property
      tip="spacing"
      :char-spacing="attrs.charSpacing"
      :line-height="attrs.lineHeight"
      @update:char-spacing="updateCharSpacing"
      @update:line-height="updateLineHeight"
    ></spacing-property>
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
