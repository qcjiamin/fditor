<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { EditorKey } from '@/constants/injectKey'
  import type { Editor, HorizontalAlign, VerticalAlign } from '@fditor/core'
  import { computed, inject, onMounted, onUnmounted, reactive } from 'vue'
  import opacityProperty from '@/views/editer/components/propertyBar/opacity-property.vue'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { Lock, Unlock, Delete, Orange } from '@element-plus/icons-vue'
  import positionProperty from '@/views/editer/components/propertyBar/publicBar/position-property.vue'
  import hotkeys from 'hotkeys-js'

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
  const showLockIcon = computed(() => {
    return editorStore.selectType !== 'activeselection'
  })

  function getAttrs() {
    const shape = editorStore.selected!
    attrs.opacity = shape.opacity
    attrs.lock = shape.isLock()
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

  const openAni = computed(() => editorStore.sidebarShowTab === 'animation')
  function toggleAnimate() {
    if (editorStore.sidebarShowTab === 'animation') {
      editorStore.setSidebarShowTab('resource')
    } else {
      editorStore.setSidebarShowTab('animation')
    }
  }
  function toggleLock() {
    const selected = editorStore.selected
    if (!selected) {
      throw new Error('testLeft, but no object was selected ')
    }
    if (selected.isLock()) {
      selected.unlock()
    } else {
      selected.lock()
    }
    // editor.render()
  }
  async function deleteObj() {
    console.log('delete')
    const activeObj = editor.stage.getActiveObject()
    if (!activeObj) throw new Error('delete, but no object was selected ')

    const removed = editor.stage._removeSelected()
    if (!removed) throw new Error('removeSelected return null')
    editor.emit('node:remove', removed)
  }

  function updateAlign(type: HorizontalAlign | VerticalAlign) {
    const selected = editor.getSelectedObject()
    selected.setAlign(type)
  }

  onMounted(() => {
    hotkeys('del', function () {
      deleteObj()
    })
  })
  onUnmounted(() => {
    hotkeys.unbind('del')
  })
</script>

<template>
  <div class="historyBox">
    <position-property
      tip="change position"
      :horizontal="attrs.horizontal"
      :vertical="attrs.vertical"
      @update:align="updateAlign"
    ></position-property>
    <opacity-property :opacity="attrs.opacity" tip="opacity" @update:opacity="updateOpacity"></opacity-property>
    <property-normal-item tip="animate" :active="openAni" @click="toggleAnimate">
      <Orange></Orange>
    </property-normal-item>
    <property-normal-item
      v-if="showLockIcon"
      :active="attrs.lock"
      :tip="attrs.lock ? 'unlock' : 'lock'"
      @click="toggleLock"
    >
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
