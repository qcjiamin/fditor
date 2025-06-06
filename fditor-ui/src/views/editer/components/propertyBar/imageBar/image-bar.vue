<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import type { Editor } from '@kditor/core'
  import { Circle } from 'fabric'
  import { inject } from 'vue'

  const editor = inject(EditorKey) as Editor
  const editorStore = useEditorStore()
  const selected = editorStore.selected
  function enterCrop() {
    editor.enterCrop()
  }
  function addClippath() {
    const circle = new Circle({
      radius: 50,
      originX: 'center',
      originY: 'center'
    })
    const center = selected!.getCenterPoint()
    selected!.eset({
      clipPath: circle,
      left: center.x - 50,
      top: center.y - 50
      // width: circle.width,
      // height: circle.height
    })
    selected!.setCoords()
  }
</script>

<template>
  <div>
    <button @click="enterCrop">do</button>
    <button @click="addClippath">clip</button>
  </div>
</template>

<style scoped lang="scss"></style>
