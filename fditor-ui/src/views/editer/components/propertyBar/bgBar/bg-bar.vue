<script lang="ts" setup>
  import { inject, onMounted, reactive, watch } from 'vue'
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
    // attrs.fill = editor.getBackgroundColor() as string
    //! editor.stage 在初次进入时可能为空
    if (!editor.stage) return
    attrs.color = colorInstance2Info(editor.stage?.backgroundColor as colorVal)
    console.log(attrs.color)
  }
  useGetAttrs(getAttrs)

  onMounted(() => {
    console.log('render bgbar')
  })

  // fill
  watch(
    () => attrs.color,
    (info) => {
      if (info === null) throw new Error('color null')
      console.log(info)
      if (info.type === 'solid') {
        editor.stage.backgroundColor = info.value
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
          editor.stage.backgroundColor = gradient
        } else if (gradientInfo.type === 'radial') {
          const gradient = createRadialGradient(
            'pixels',
            gradientInfo.percent,
            editor.workspace.width,
            editor.workspace.height,
            ...gradientInfo.colors
          )
          editor.stage.backgroundColor = gradient
        }
      }

      editor.stage.renderAll()
    },
    {
      deep: true
    }
  )
</script>

<template>
  <div class="typeBar">
    <fill-property v-model:color="attrs.color"></fill-property>
  </div>
</template>

<style scoped lang="scss"></style>
