<script lang="ts" setup>
  import { inject, reactive, watch } from 'vue'
  import fillProperty from '@/views/editer/components/propertyBar/fill-property.vue'
  import type { Editor } from '@kditor/core'
  import { EditorKey } from '@/constants/injectKey'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  const editor = inject(EditorKey) as Editor
  interface bgAttrs {
    // fill: konvaFill
    fill: string
  }
  const attrs: bgAttrs = reactive({
    fill: 'rgba(255,255,255,1)'
  })
  function getAttrs() {
    // attrs.fill = editor.getBackgroundColor() as string
    //! editor.stage 在初次进入时可能为空
    attrs.fill = editor.stage ? (editor.stage?.backgroundColor as string) : 'rgba(255,255,255,1)'
  }
  useGetAttrs(getAttrs)

  // fill
  watch(
    () => attrs.fill,
    (val) => {
      editor.stage.backgroundColor = val
      editor.stage.renderAll()
    }
  )
</script>

<template>
  <div class="typeBar">
    <fill-property v-model:fill="attrs.fill"></fill-property>
  </div>
</template>

<style scoped lang="scss"></style>
