<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor } from '@kditor/core'
  import { inject, reactive } from 'vue'
  import opacityProperty from '@/views/editer/components/propertyBar/opacity-property.vue'

  const editor = inject(EditorKey) as Editor

  interface PublicAttrs {
    opacity: number
  }
  const attrs: PublicAttrs = reactive({
    opacity: 1
  })

  function updateOpacity(_opacity: number, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    if (commit) {
      shape.eset('opacity', _opacity, false)
    } else {
      shape.set('opacity', _opacity)
    }
    editor.render()
  }

  function deleteObj() {
    console.log('delete')
    const activeObj = editor.stage.getActiveObject()
    if (!activeObj) throw new Error('delete, but no object was selected ')
    editor.remove(activeObj)
  }
</script>

<template>
  <div class="historyBox">
    <opacity-property :opacity="attrs.opacity" tip="opacity" @update:opacity="updateOpacity"></opacity-property>
    <button class="lock">L</button>
    <button class="delete" @click="deleteObj">D</button>
  </div>
</template>

<style scoped lang="scss">
  .historyBox {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    column-gap: 5px;
    .delete {
      width: 30px;
      height: 30px;
      background-color: aqua;
    }
    .lock {
      width: 30px;
      height: 30px;
      background-color: aqua;
    }
  }
</style>
