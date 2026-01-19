<script lang="ts" setup>
  import type { updateColorOptions } from '@/components/colorPicker/types'
  import { EditorKey } from '@/constants/injectKey'
  import { isActiveSelection, isGroup, type Editor, type HorizontalAlign, type VerticalAlign } from '@fditor/core'
  import { computed, inject, onMounted, onUnmounted, reactive } from 'vue'
  import opacityProperty from '@/views/editer/components/propertyBar/publicBar/opacity-property.vue'
  import propertyNormalItem from '@/views/editer/components/propertyBar/components/property-normal-item.vue'
  import { useEditorStore } from '@/stores/editorStore'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import { Lock, Unlock, Delete, Orange } from '@element-plus/icons-vue'
  import positionProperty from '@/views/editer/components/propertyBar/publicBar/position-property.vue'
  import hotkeys from 'hotkeys-js'
  import { useAlign } from '@/stores/commands/useAlign'
  import { useAttrModify } from '@/stores/commands/useModifyAttr'

  const { setAlign } = useAlign()

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
  const { modifyAttr } = useAttrModify()

  function updateOpacity(_opacity: number, { commit }: updateColorOptions) {
    const shape = editor.stage.getActiveObject()!
    // const selectIds = editorStore.selected

    if (commit) {
      modifyAttr(shape, { opacity: _opacity })
      // shape.eset('opacity', _opacity, false)
    } else {
      if (isActiveSelection(shape) || isGroup(shape)) {
        shape.mapset('opacity', _opacity)
      } else {
        shape.set('opacity', _opacity)
      }
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
    editor.remove()
  }

  function updateAlign(type: HorizontalAlign | VerticalAlign) {
    const selected = editor.getActiveObject()
    //todo: 这里需要处理没有选中对象的异常
    if (!selected) return

    // selected.setAlign(type)
    setAlign(selected, type, { left: selected.left, top: selected.top })
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
  <div class="figmaPublicBar">
    <position-property
      tip="change position"
      :horizontal="attrs.horizontal"
      :vertical="attrs.vertical"
      @update:align="updateAlign"
    ></position-property>
    <opacity-property :opacity="attrs.opacity" tip="opacity" @update:opacity="updateOpacity"></opacity-property>
    <property-normal-item tip="animate" :active="openAni" @click="toggleAnimate">
      <el-icon size="20">
        <Orange class="figma-icon"></Orange>
      </el-icon>
    </property-normal-item>
    <property-normal-item
      v-if="showLockIcon"
      :active="attrs.lock"
      :tip="attrs.lock ? 'unlock' : 'lock'"
      @click="toggleLock"
    >
      <el-icon v-if="attrs.lock" size="20" color="#409EFF">
        <Lock class="figma-icon"></Lock>
      </el-icon>
      <el-icon v-else size="20">
        <Unlock class="figma-icon"></Unlock>
      </el-icon>
    </property-normal-item>
    <property-normal-item tip="delete" @click="deleteObj">
      <el-icon size="20">
        <Delete class="figma-icon"></Delete>
      </el-icon>
    </property-normal-item>
  </div>
</template>

<style scoped lang="scss">
  .figmaPublicBar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  }

  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
