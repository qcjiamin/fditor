<script lang="ts" setup>
  import { ref } from 'vue'
  import type { FontWeightKey } from '../../../../../utils/constants'
  import Arrow from '@/assets/icons/fontsTab/arrow.svg'
  import FontSelected from '@/assets/icons/fontsTab/font-selected.svg'
  import type { FontFamilyName } from '@/utils/types'
  import type { updateFontFamilyWeightParam } from '@/views/editer/components/sidebar/types'

  const emit = defineEmits<{
    'update:fontfamily': [value: FontFamilyName, weight: updateFontFamilyWeightParam] // named tuple syntax
  }>()
  const {
    selected = false,
    weight = 'regular',
    fontName,
    weightList
  } = defineProps<{
    selected: boolean
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
  <div>
    <div class="fontFamily" @click="selectFontFamily()">
      <div @click="toggleOpen"><Arrow /></div>
      <div class="fontName">{{ fontName }}</div>
      <div v-if="!openSubRef && selected"><FontSelected></FontSelected></div>
    </div>
    <div v-if="openSubRef" class="subFontFamilyBox">
      <div v-for="item in weightList" :key="item" class="subFontFamily" @click="selectSub(item)">
        <div class="subFontName">{{ item }}</div>
        <div v-if="selected && item === weight"><FontSelected></FontSelected></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .fontFamily {
    display: flex;
    padding-right: 10px;
    &:hover {
      background-color: red;
    }
    .fontName {
      flex-grow: 1;
    }
  }
  .subFontFamilyBox {
    .subFontFamily {
      display: flex;
      padding-left: 30px;
      padding-right: 10px;
      &:hover {
        background-color: red;
      }
      .subFontName {
        flex-grow: 1;
      }
    }
  }
</style>
