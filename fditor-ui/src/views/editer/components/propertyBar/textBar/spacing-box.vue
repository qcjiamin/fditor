<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import type { updateColorOptions } from '@/components/colorPicker/types'

  const emit = defineEmits<{
    'update:charSpacing': [number, options: updateColorOptions]
    'update:lineHeight': [number, options: updateColorOptions]
  }>()
  const { charSpacing, lineHeight } = defineProps<{
    charSpacing: number
    lineHeight: number
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

  function inputCharSpacing(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:charSpacing', val, { commit: false })
  }

  function updateCharSpacing(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:charSpacing', val, { commit: true })
  }

  function inputLineHeight(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:lineHeight', val, { commit: false })
  }
  function updateLineHeight(val: number | number[]) {
    if (Array.isArray(val)) return
    emit('update:lineHeight', val, { commit: true })
  }
</script>

<template>
  <div class="spacingBox">
    <div class="spacingItem">
      <div>字间距</div>
      <el-slider
        id="charspacing"
        v-model="charSpacingRef"
        show-input
        :show-input-controls="false"
        size="small"
        :max="800"
        :min="-200"
        @input="inputCharSpacing"
        @change="updateCharSpacing"
      />
    </div>
    <div class="spacingItem">
      <div>行高</div>
      <el-slider
        id="lineheight"
        v-model="lineHeightRef"
        show-input
        :show-input-controls="false"
        size="small"
        :min="0.5"
        :max="2.5"
        :step="0.01"
        @input="inputLineHeight"
        @change="updateLineHeight"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .spacingBox {
    width: 200px;
    display: flex;
    flex-direction: column;
    .spacingItem {
      display: flex;
      flex-direction: column;
      :deep(.el-slider__input) {
        width: 60px;
      }
    }
  }
</style>
