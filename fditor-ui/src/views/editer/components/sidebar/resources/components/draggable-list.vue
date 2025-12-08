<script setup lang="ts">
  // import { ref } from 'vue'
  import type { dragSortEvent } from './type'
  import { VueDraggableNext as draggable, type DragChangeEvent, type SortableEvent } from 'vue-draggable-next'

  type listItem = {
    id: string
    url: string
    // 选中的id
    selected: boolean
  }

  const props = defineProps<{
    list: listItem[]
  }>()
  const emit = defineEmits<{
    move: [dragSortEvent]
    select: [string]
  }>()

  function onListChange(event: DragChangeEvent<listItem>) {
    if (event.moved) {
      console.log(event)
      emit('move', {
        id: event.moved.element.id,
        from: event.moved.oldIndex,
        to: event.moved.newIndex
      })
    }
  }
  function onChoose(event: SortableEvent) {
    console.log(event)
  }
  function onSelect(e: MouseEvent) {
    console.log('emit select')
    const target = e.target as HTMLElement
    if (!target || !target.dataset) return
    if (!target.dataset.id) return
    // console.log('emit select', target.dataset.id)
    emit('select', target.dataset.id)
  }
</script>

<template>
  <draggable
    :list="props.list"
    tag="transition-group"
    :component-data="{
      tag: 'div',
      name: 'fade'
    }"
    :animation="300"
    ghost-class="ghost"
    chosen-class="chosen"
    handle=".drag-handle"
    class="draggable-container"
    @change="onListChange"
    @choose="onChoose"
  >
    <div v-for="item in list" :key="item.id" :class="['fade-item', { selected: item.selected }]">
      <span class="drag-handle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="8" cy="4" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
        </svg>
      </span>
      <div :data-id="item.id" class="contentBox" @click="onSelect">
        <img :src="item.url" alt="" />
      </div>
    </div>
  </draggable>
</template>

<style lang="scss" scoped>
  .draggable-container {
    width: 100%;
  }

  .fade-item {
    display: flex;
    align-items: center;
    gap: 3px;
    // padding: 15px;
    padding-left: 15px;
    margin: 8px 0;
    // background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    // color: white;
    border-radius: 8px;
    will-change: transform;
    border: 1px solid rgb(88, 87, 87);
    &.selected {
      border: 1px solid rgb(124, 155, 240);
    }
    .contentBox {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      line-height: 50px;
      flex: 1;
      user-select: none;
      img {
        pointer-events: none;
      }
    }
  }

  /* 拖拽手柄 */
  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: grab;
    opacity: 0.6;
    transition: opacity 0.2s;
    flex-shrink: 0;
    // 阻止冒泡
  }

  .drag-handle:hover {
    opacity: 1;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  /* 被拖拽的元素（原位置）- 隐藏但保留占位 */
  .ghost {
    opacity: 0 !important;
  }

  /* 被选中准备拖拽的元素 */
  .chosen {
    opacity: 0.5;
  }

  /* 位置变化时的平滑过渡 - 关键！ */
  .fade-move {
    transition: transform 0.5s ease-out;
  }
</style>
