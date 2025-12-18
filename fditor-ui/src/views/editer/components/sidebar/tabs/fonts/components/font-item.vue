<script lang="ts" setup>
  import { ref } from 'vue'
  import type { FontWeightKey } from '../../../../../../../utils/constants'
  import Arrow from '@/assets/icons/fontsTab/arrow.svg'
  import FontSelected from '@/assets/icons/fontsTab/font-selected.svg'
  import type { FontFamilyName } from '@/utils/types'
  import type { updateFontFamilyWeightParam } from '@/views/editer/components/sidebar/types'

  const emit = defineEmits<{
    'update:fontfamily': [value: FontFamilyName, weight: updateFontFamilyWeightParam] // named tuple syntax
  }>()
  const {
    selected = false,
    beingLoaded = false,
    weight = 'regular',
    fontName,
    weightList
  } = defineProps<{
    selected: boolean
    beingLoaded: boolean
    weight: FontWeightKey
    fontName: FontFamilyName
    weightList: FontWeightKey[]
  }>()
  const openSubRef = ref(false)
  function toggleOpen(e: MouseEvent) {
    openSubRef.value = !openSubRef.value
    e.stopPropagation()
  }
  function selectFontFamily() {
    // 选中自身
    if (selected) return
    // 通知外部修改
    // 当前字重？
    emit('update:fontfamily', fontName, 'inherit')
  }
  function selectSub(subType: FontWeightKey) {
    if (selected && subType === weight) return
    // 通知外部修改
    emit('update:fontfamily', fontName, subType)
  }
</script>

<template>
  <div class="font-item-container">
    <div class="font-family-item" @click="selectFontFamily()">
      <div class="font-controls" @click="toggleOpen">
        <Arrow :class="{ 'rotate-icon': openSubRef }" />
      </div>
      <div class="font-name">{{ fontName }}</div>
      <div v-if="!beingLoaded && !openSubRef && selected" class="selected-indicator">
        <FontSelected />
      </div>
      <div v-if="beingLoaded" class="loading-indicator">...</div>
    </div>
    <div v-if="openSubRef" class="sub-font-family-box">
      <div
        v-for="item in weightList"
        :key="item"
        class="sub-font-family-item"
        @click="selectSub(item)"
      >
        <div class="sub-font-name">{{ item }}</div>
        <div v-if="selected && item === weight" class="selected-indicator">
          <FontSelected />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .font-item-container {
    width: 100%;
  }

  .font-family-item,
  .sub-font-family-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 4px;
    margin: 0 8px;

    &:hover {
      background-color: #f3f4f6;
    }

    .font-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-right: 8px;
      cursor: pointer;
      transition: transform 0.2s;

      .rotate-icon {
        transform: rotate(90deg);
      }
    }

    .font-name,
    .sub-font-name {
      flex: 1;
      font-size: 13px;
      color: #374151;
    }

    .selected-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .loading-indicator {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .sub-font-family-box {
    padding: 0 4px;

    .sub-font-family-item {
      padding-left: 36px;
      padding-right: 12px;
      margin: 0;
    }
  }
</style>
