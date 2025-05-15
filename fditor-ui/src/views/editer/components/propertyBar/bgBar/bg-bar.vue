<script lang="ts" setup>
  import { inject, onMounted, onUnmounted, onUpdated, reactive } from 'vue'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import { createLinearGradient, createRadialGradient, type colorVal, type Editor } from '@kditor/core'
  import { EditorKey } from '@/constants/injectKey'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import type { ColorInfo } from '@/views/editer/components/propertyBar/types'
  import { colorInstance2Info } from '@/utils/common'
  const editor = inject(EditorKey) as Editor
  interface bgAttrs {
    color: ColorInfo
  }
  const attrs: bgAttrs = reactive({
    color: {
      type: 'solid',
      value: 'rgba(255,255,255,1)'
    }
  })
  function getAttrs() {
    //! editor.stage 在初次进入时可能为空
    if (!editor.stage) return
    console.log('get bg color')
    console.log(editor.stage?.backgroundColor)
    attrs.color = colorInstance2Info(editor.stage?.backgroundColor as colorVal)
  }
  useGetAttrs(getAttrs)

  onMounted(() => {
    // 加载完成后，重新获取一遍 bg 属性 !! 优化？
    editor.on('canvas:ready', getAttrs)
  })
  onUnmounted(() => {
    editor.off('canvas:ready', getAttrs)
  })

  // 实现背景色设置功能
  function updateColor(info: ColorInfo) {
    if (info.type === 'solid') {
      if (!info.value) throw new Error('color null')
      editor.stage.eset('backgroundColor', info.value)
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
        editor.stage.eset('backgroundColor', gradient)
      } else if (gradientInfo.type === 'radial') {
        const gradient = createRadialGradient(
          'pixels',
          gradientInfo.percent,
          editor.workspace.width,
          editor.workspace.height,
          ...gradientInfo.colors
        )
        editor.stage.eset('backgroundColor', gradient)
      }
    }

    editor.stage.renderAll()
  }
  onUpdated(() => {
    console.log(attrs.color)
  })
</script>

<template>
  <div class="typeBar">
    <fill-property :color="attrs.color" @update:color="updateColor"></fill-property>
  </div>
</template>

<style scoped lang="scss"></style>
