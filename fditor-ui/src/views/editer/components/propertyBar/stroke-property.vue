<script lang="ts" setup>
  import { computed } from 'vue'
  import strokeBox from '@/components/stroke-box/stroke-box.vue'
  import strokeIcon from '@/assets/icons/stroke.svg'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  const emit = defineEmits(['update:dash', 'update:strokeWidth'])

  const { dash, strokeWidth, maxWidth } = defineProps<{
    dash: number[]
    strokeWidth: number
    maxWidth: number
  }>()

  const dashType = computed(() => dash[0].toString())

  function updateDash(_dash: string) {
    emit('update:dash', [Number(_dash)])
  }
  function updateStrokeWidth(_strokeWidth: string) {
    emit('update:strokeWidth', _strokeWidth)
  }
</script>

<template>
  <property-item>
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
