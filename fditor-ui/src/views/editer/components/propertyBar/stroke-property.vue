<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import strokeBox from '@/components/stroke-box/stroke-box.vue'
  import strokeIcon from '@/assets/icons/stroke.svg'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  const emit = defineEmits(['update:dash', 'update:strokeWidth'])

  const { dash, strokeWidth, maxWidth } = defineProps<{
    dash: number[]
    strokeWidth: number
    maxWidth: number
  }>()

  const dashType = ref(dash[0].toString())
  watch(
    () => dash,
    (_dash) => {
      dashType.value = _dash[0].toString()
    }
  )
  watch(dashType, (newType) => {
    emit('update:dash', [Number(newType)])
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
  <property-item>
    <template #anchor>
      <strokeIcon class="anchorIocn"></strokeIcon>
    </template>
    <template #popup>
      <stroke-box v-model:dash="dashType" v-model:stroke-width="localStrokeWidth" :max-width="maxWidth"></stroke-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .anchorIocn {
    width: 100%;
    // height: 30px;
  }
</style>
