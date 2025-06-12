<script lang="ts" setup>
  import flipBox from '@/views/editer/components/propertyBar/imageBar/flip-box.vue'
  import propertyItem from '@/views/editer/components/propertyBar/property-item.vue'
  const { tip = '' } = defineProps<{
    tip?: string
  }>()
</script>

<template>
  <property-item :tip="tip">
    <template #anchor> <div>flip</div> </template>
    <template #popup>
      <flip-box></flip-box>
    </template>
  </property-item>
</template>

<style scoped lang="scss"></style>
