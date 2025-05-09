<script lang="ts" setup>
  // import type { StrokeConfig } from '@/views/editer/components/propertyBar/types'
  import strokeNoneIcon from '@/assets/icons/stroke-none.svg'
  import stroke0Icon from '@/assets/icons/stroke-0.svg'
  import stroke15Icon from '@/assets/icons/stroke-15.svg'
  import stroke10Icon from '@/assets/icons/stroke-10.svg'
  import stroke5Icon from '@/assets/icons/stroke-5.svg'
  import { ref, watch } from 'vue'
  const emit = defineEmits(['update:dash', 'update:strokeWidth'])
  const { dash, strokeWidth } = defineProps<{
    dash: string
    strokeWidth: number
    maxWidth: number
  }>()
  const dashType = ref(dash)
  watch(
    () => dash,
    (_dash) => {
      dashType.value = _dash
    }
  )
  watch(dashType, (newType) => {
    emit('update:dash', newType)
  })
  const localStrokeWidth = ref(strokeWidth)
  watch(
    () => strokeWidth,
    (_strokeWidth) => {
      localStrokeWidth.value = _strokeWidth
    }
  )
  watch(localStrokeWidth, (val) => {
    emit('update:strokeWidth', val)
  })
</script>

<template>
  <div class="strokeBox">
    <div class="dash">
      <el-radio-group v-model="dashType" size="small">
        <el-radio-button label="-1" value="-1"><strokeNoneIcon /></el-radio-button>
        <el-radio-button label="0" value="0"><stroke0Icon /></el-radio-button>
        <el-radio-button label="15" value="15"><stroke15Icon /></el-radio-button>
        <el-radio-button label="10" value="10"><stroke10Icon /></el-radio-button>
        <el-radio-button label="5" value="5"><stroke5Icon /></el-radio-button>
      </el-radio-group>
    </div>
    <div class="strokeWidth">
      <div>描边粗细</div>
      <el-slider
        v-model="localStrokeWidth"
        show-input
        :show-input-controls="false"
        size="small"
        :max="Math.floor(maxWidth)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .strokeBox {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    .strokeWidth {
      font-size: 15px;
      display: flex;
      flex-direction: column;
      row-gap: 5px;
    }
  }
</style>
