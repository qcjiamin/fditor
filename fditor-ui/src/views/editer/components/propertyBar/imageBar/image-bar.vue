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
    // const rect = new Rect({
    //   w: selected?.getScaledWidth(),
    //   h: selected?.getScaledHeight(),
    //   left: selected?.left,
    //   top: selected?.top,
    //   fill: 'transparent',
    //   stroke: 'black',
    //   strokeWidth: 2
    // })

    const circle = new Circle({
      radius: 50,
      left: -50,
      top: -50
    })

    const center = selected!.getCenterPoint()
    selected!.eset({
      clipPath: circle,
      left: center.x - 50,
      top: center.y - 50
    })
    selected!.setCoords()
    // selected!.width = circle.width
    // selected!.height = circle.height
  }
</script>

<template>
  <div>
    <button @click="enterCrop">do</button>
    <button @click="addClippath">clip</button>
  </div>
</template>

<style scoped lang="scss"></style>
