<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor, HorizontalAlign, VerticalAlign } from '@fditor/core'
  import { computed, inject, reactive } from 'vue'
  import opacityProperty from '@/views/editer/components/propertyBar/opacity-property.vue'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { Lock, Unlock, Delete, Orange } from '@element-plus/icons-vue'
  import { ActiveSelection, FabricObject } from 'fabric'
  import positionProperty from '@/views/editer/components/propertyBar/publicBar/position-property.vue'
  const editorStore = useEditorStore()
  const editor = inject(EditorKey) as Editor

  interface PublicAttrs {
    opacity: number
    lock: boolean
    horizontal: HorizontalAlign | ''
    vertical: VerticalAlign | ''
  }
  const attrs: PublicAttrs = reactive({
    opacity: 1,
    lock: false,
    horizontal: '',
    vertical: ''
  })

  function getAttrs() {
    const shape = editorStore.selected!
    attrs.opacity = shape.opacity
    attrs.lock = shape.lockMovementX
    const positionInfo = shape.getAlign()
    attrs.horizontal = positionInfo.h
    attrs.vertical = positionInfo.v
  }
  useGetAttrs(getAttrs)

  function updateOpacity(_opacity: number, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    if (commit) {
      shape.eset('opacity', _opacity, false)
    } else {
      shape.set('opacity', _opacity)
    }
    editor.render()
  }

  const openAni = computed(() => editorStore.sidebarShowProperty === 'animate')
  function toggleAnimate() {
    if (editorStore.sidebarShowProperty === 'animate') {
      editorStore.setSidebarShowProperty('')
    } else {
      editorStore.setSidebarShowProperty('animate')
    }
  }
  function toggleLock() {
    if (!editorStore.selected) {
      throw new Error('testLeft, but no object was selected ')
    }
    editorStore.selected.eset('lockMovementX', !editorStore.selected.lockMovementX)
    editor.render()
  }
  async function deleteObj() {
    console.log('delete')
    const activeObj = editor.stage.getActiveObject()
    if (!activeObj) throw new Error('delete, but no object was selected ')
    let objs: FabricObject[] = []
    if (activeObj instanceof ActiveSelection) {
      objs = [...activeObj._objects]
    } else {
      objs.push(activeObj)
    }

    const removed = editor.stage._removeSelected()
    if (!removed) throw new Error('removeSelected return null')
    editor.emit('node:remove', removed)
  }
  function updateAlign(type: HorizontalAlign | VerticalAlign) {
    const selected = editor.getSelectedObject()
    selected.setAlign(type)
  }
</script>

<template>
  <div class="historyBox">
    <position-property
      :horizontal="attrs.horizontal"
      :vertical="attrs.vertical"
      @update:align="updateAlign"
    ></position-property>
    <opacity-property :opacity="attrs.opacity" tip="opacity" @update:opacity="updateOpacity"></opacity-property>
    <property-normal-item tip="animate" :active="openAni" @click="toggleAnimate">
      <Orange></Orange>
    </property-normal-item>
    <property-normal-item :active="attrs.lock" :tip="attrs.lock ? 'unlock' : 'lock'" @click="toggleLock">
      <el-icon v-if="attrs.lock" size="20" color="#409EFF">
        <Lock></Lock>
      </el-icon>
      <el-icon v-else size="20">
        <Unlock></Unlock>
      </el-icon>
    </property-normal-item>
    <property-normal-item tip="delete" @click="deleteObj">
      <el-icon size="20">
        <Delete></Delete>
      </el-icon>
    </property-normal-item>
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
      width: 20px;
      height: 20px;
      background-color: aqua;
    }
  }
</style>
