<script lang="ts" setup>
  import { computed } from 'vue'
  import strokeBox from '@/components/stroke-box/stroke-box.vue'
  import strokeIcon from '@/assets/icons/stroke.svg'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'
  const emit = defineEmits<{
    'update:dash': [number[]]
    'update:strokeWidth': [width: number, options: updateColorOptions]
  }>()

  const {
    dash,
    strokeWidth,
    maxWidth,
    tip = ''
  } = defineProps<{
    dash: number[]
    strokeWidth: number
    maxWidth: number
    tip?: string
  }>()

  const dashType = computed(() => dash[0].toString())

  function updateDash(_dash: string) {
    emit('update:dash', [Number(_dash)])
  }
  function updateStrokeWidth(_strokeWidth: number, options: updateColorOptions) {
    emit('update:strokeWidth', _strokeWidth, options)
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <strokeIcon class="anchorIocn"></strokeIcon>
    </template>
    <template #popup>
      <stroke-box
        :stroke-width="strokeWidth"
        :dash="dashType"
        :max-width="maxWidth"
        @update:dash="updateDash"
        @update:stroke-width="updateStrokeWidth"
      ></stroke-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchorIocn {
    width: 100%;
    // height: 30px;
  }
</style>
