<script lang="ts" setup>
  import { inject, onMounted, onUnmounted, ref } from 'vue'
  import draggableList from './draggable-list.vue'
  import type { draggableListItem, dragSortEvent } from '@/views/editer/components/sidebar/resources/components/type'
  import { EditorKey } from '@/constants/injectKey'
  import { isActiveSelection, type Editor } from '@fditor/core'
  import type { FabricObject } from 'fabric'

  const editor = inject(EditorKey) as Editor

  function getThumUrl(obj: FabricObject) {
    const cvs = obj.toCanvasElement({})
    const ratio = 43 / cvs.height
    const _cvs = document.createElement('canvas')
    _cvs.width = cvs.width * ratio
    _cvs.height = 43
    const _ctx = _cvs.getContext('2d') as CanvasRenderingContext2D
    _ctx.drawImage(cvs, 0, 0, cvs.width * ratio, 43)
    const url = _cvs.toDataURL()
    return url
  }

  function getDraList() {
    const objs = editor.stage.getObjects()
    const selectObj = editor.getActiveObject()
    const selectIds: string[] = []
    if (selectObj) {
      if (isActiveSelection(selectObj)) {
        selectObj._objects.forEach((obj) => {
          selectIds.push(obj.id)
        })
      } else {
        selectIds.push(selectObj.id)
      }
    }
    const list: draggableListItem[] = []
    objs.forEach((obj) => {
      const item = {} as draggableListItem
      item.id = obj.id
      item.selected = selectIds.includes(obj.id)
      item.url = getThumUrl(obj)
      list.push(item)
    })
    list.reverse()
    return list
  }

  const list = ref<draggableListItem[]>([
    {
      id: '123',
      url: 'url1',
      selected: true
    },
    {
      id: '456',
      url: 'url2',
      selected: false
    }
  ])

  function updateList() {
    list.value = getDraList()
  }

  onMounted(() => {
    list.value = getDraList()
    // 监听选中的修改，修改时更新列表
    //todo 性能优化方案，选中修改后，收集id, 提供给当前组件，组件内更新选中的元素。 成组、解组？
    editor.on('selected:change', updateList)
  })
  onUnmounted(() => {
    editor.off('selected:change', updateList)
  })

  function onSelect(id: string) {
    // 先对比当前选中的元素和要选择的元素是否是同一个元素, 不是的话再执行后续选中逻辑
    const obj = editor.getActiveObject()
    const nowId = obj ? obj.id : undefined
    if (nowId === id) return
    const toObj = editor.getObjectById(id)
    if (!toObj) throw Error('onSelect no object with the ID')

    // 选中id对应对象
    // todo 在Editor对象上封装选中方法
    editor.stage.setActiveObject(toObj)
    editor.render()
  }

  function onMove(e: dragSortEvent) {
    const sum = editor.stage.getObjects().length
    const obj = editor.getObjectById(e.id)
    if (!obj) throw Error('onMove no object with the ID')
    // 列表展示的与画布内渲染的顺序相反
    editor.stage.moveObjectTo(obj, sum - 1 - e.to)
  }
</script>

<template>
  <draggableList :list @select="onSelect" @move="onMove"></draggableList>
</template>

<style scoped lang="scss"></style>
