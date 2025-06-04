<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  import FontSpacing from '@/assets/icons/fontbar/font-spacing.svg'
  import spacingBox from '@/views/editer/components/propertyBar/textBar/spacing-box.vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'

  const emit = defineEmits<{
    'update:charSpacing': [number, options: updateColorOptions]
    'update:lineHeight': [number, options: updateColorOptions]
  }>()

  const {
    charSpacing,
    lineHeight,
    tip = ''
  } = defineProps<{
    charSpacing: number
    lineHeight: number
    tip?: string
  }>()

  const charSpacingRef = ref(charSpacing)
  const lineHeightRef = ref(lineHeight)
  watch(
    () => charSpacing,
    (_charSpacing) => {
      charSpacingRef.value = _charSpacing
    }
  )
  watch(
    () => lineHeight,
    (_lineHeight) => {
      lineHeightRef.value = _lineHeight
    }
  )

  function updateCharSpacing(val: number, options: updateColorOptions) {
    emit('update:charSpacing', val, options)
  }
  function updateLineHeight(val: number, options: updateColorOptions) {
    emit('update:lineHeight', val, options)
  }
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <FontSpacing></FontSpacing>
    </template>
    <template #popup>
      <spacing-box
        :char-spacing="charSpacingRef"
        :line-height="lineHeightRef"
        @update:char-spacing="updateCharSpacing"
        @update:line-height="updateLineHeight"
      ></spacing-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchorIcon {
    width: 100%;
    // height: 30px;
  }
</style>
