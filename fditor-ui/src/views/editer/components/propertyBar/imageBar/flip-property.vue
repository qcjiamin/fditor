<script lang="ts" setup>
  import flipBox from '@/views/editer/components/propertyBar/imageBar/flip-box.vue'
  import propertyItem from '@/views/editer/components/propertyBar/components/property-item.vue'
  // import FlipIcon from '@/assets/icons/imgbar/flip.svg'
  const { tip = '' } = defineProps<{
    tip?: string
  }>()
</script>

<template>
  <property-item :tip="tip">
    <template #anchor>
      <!-- <FlipIcon class="figma-icon"></FlipIcon> -->
      <div>flip</div>
    </template>
    <template #popup>
      <flip-box></flip-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss">
  .figma-icon {
    width: 18px;
    height: 18px;
  }
</style>
