<script lang="ts" setup>
  import AlignLeft from '@/assets/icons/fontbar/align_left.svg'
  import AlignCenter from '@/assets/icons/fontbar/align_center.svg'
  import AlignRight from '@/assets/icons/fontbar/align_right.svg'
  import { ref, watch } from 'vue'
  import type { alignType } from '@/views/editer/components/propertyBar/textBar/types'

  const { align = 'left' } = defineProps<{
    align: alignType
  }>()
  const emit = defineEmits<{
    'update:align': [alignType]
  }>()
  const alignRef = ref(align)

  watch(
    () => align,
    (_align) => {
      alignRef.value = _align
    }
  )

  function updateAlign(e: MouseEvent) {
    const target = e.target as HTMLDivElement
    emit('update:align', target.dataset.align as alignType)
  }
</script>

<template>
  <div class="alignBox" @click="updateAlign">
    <div class="alignItem" :class="{ active: alignRef === 'left' }" data-align="left"
      ><AlignLeft class="alignIcon"></AlignLeft
    ></div>
    <div class="alignItem" :class="{ active: alignRef === 'center' }" data-align="center"
      ><AlignCenter class="alignIcon"></AlignCenter
    ></div>
    <div class="alignItem" :class="{ active: alignRef === 'right' }" data-align="right"
      ><AlignRight class="alignIcon"></AlignRight
    ></div>
  </div>
</template>

<style scoped lang="scss">
  .alignBox {
    display: flex;

    column-gap: 5px;
    .alignItem {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      &.active {
        background-color: rgba(57, 76, 96, 0.15);
      }
      &:hover {
        background-color: rgba(64, 87, 109, 0.07);
      }
      .alignIcon {
        pointer-events: none;
      }
    }
  }
</style>
