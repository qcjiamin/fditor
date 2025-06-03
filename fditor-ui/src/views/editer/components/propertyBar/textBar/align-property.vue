<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import alignBox from '@/views/editer/components/propertyBar/textBar/align-box.vue'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import type { alignType } from '@/views/editer/components/propertyBar/textBar/types'
  import AlignLeft from '@/assets/icons/fontbar/align_left.svg'
  import AlignCenter from '@/assets/icons/fontbar/align_center.svg'
  import AlignRight from '@/assets/icons/fontbar/align_right.svg'
  const emit = defineEmits<{
    'update:align': [alignType]
  }>()

  const { align, tip = '' } = defineProps<{
    align: alignType
    tip?: string
  }>()

  const currentAlign = ref(align)
  watch(
    () => align,
    (_align) => {
      currentAlign.value = _align
    }
  )

  function updateAlign(val: alignType) {
    emit('update:align', val)
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <AlignLeft v-if="currentAlign === 'left'"></AlignLeft>
      <AlignCenter v-else-if="currentAlign === 'center'"></AlignCenter>
      <AlignRight v-else></AlignRight>
    </template>
    <template #popup>
      <align-box :align="currentAlign" @update:align="updateAlign"></align-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchorIcon {
    width: 100%;
    // height: 30px;
  }
</style>
