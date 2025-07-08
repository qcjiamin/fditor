<script lang="ts" setup>
  import { useEditorStore } from '@/stores/editorStore'
  import { Textbox } from 'fabric'
  import { reactive, ref } from 'vue'
  import fontItem from '@/views/editer/components/sidebar/tabs/font-item.vue'
  import { fontInfo } from '@/utils/fontinfo'
  import { AbortReason, fontWeightMap, FontWeightReverseMap, type FontWeightKey } from '@/utils/constants'
  import { typedFontInfo, type FontFamilyName, type FontStyle, type FontWeight } from '@/utils/types'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  import type { updateFontFamilyWeightParam } from '@/views/editer/components/sidebar/types'
  import { findItemByStyle, findItemByWeight, loadFontFamily } from '@/utils/fontFamilyHelper'
  import { createAbortableTaskQueueRunner } from '@/utils/common'
  import { eventBus } from '@/events/eventBus'
  //todo: 确定 props 改变，是否会影响 openRef 的值 结论: 不会

  const editorStore = useEditorStore()
  const selected = editorStore.selected
  interface FontData {
    fontfamily: string
    fontWeight: FontWeightKey
  }
  const fontData: FontData = reactive({
    fontfamily: '',
    fontWeight: 'regular'
  })
  const familiesRef = ref(Object.keys(fontInfo) as FontFamilyName[])
  const loadingRef = ref(false)
  const beingLoadedRef = ref('')

  function getFontData() {
    if (!selected) throw new Error('mounted fontsTab')
    if (!(selected instanceof Textbox)) throw new Error('mounted fontsTab, selected is not textbox')
    fontData.fontfamily = selected.fontFamily
    fontData.fontWeight = FontWeightReverseMap[selected.fontWeight as number]
    console.log(selected.fontFamily)
  }
  useGetAttrs(getFontData)

  const { enqueue, abortTask } = createAbortableTaskQueueRunner<[FontFamilyName, updateFontFamilyWeightParam], void>()
  async function updateFontFamily(signal: AbortSignal, name: FontFamilyName, weight: updateFontFamilyWeightParam) {
    if (!selected) throw new Error('mounted fontsTab')
    if (!(selected instanceof Textbox)) throw new Error('mounted fontsTab, selected is not textbox')
    //! 这里才开始设置加载状态，因为前置的有等待上一个任务的可能。上一次任务完结会把加载状态设置false
    editorStore.setInloadingFontfamily(true)

    const style = selected.fontStyle as FontStyle
    const curWeight = FontWeightReverseMap[selected.fontWeight as number]
    let _weight: FontWeightKey = 'regular'
    if (weight === 'inherit') {
      _weight = curWeight
    } else {
      _weight = weight
    }
    let _style: FontStyle = style
    if (!typedFontInfo[name]) return
    // 降级weight
    let weightArr = findItemByWeight(typedFontInfo[name], _weight)
    if (weightArr.length === 0) {
      _weight = 'regular'
      weightArr = findItemByWeight(typedFontInfo[name], _weight)
    }
    if (weightArr.length === 0) throw new Error(`${name} no weight`)
    // 降级style
    let styleArr = findItemByStyle(weightArr, _style)
    if (styleArr.length === 0) {
      _style = 'normal'
      styleArr = findItemByStyle(weightArr, _style)
    }
    if (styleArr.length === 0) throw new Error(`${name} no style`)
    if (styleArr.length > 1) throw new Error(`${name} ${_weight} ${_style} over 1`)
    const fontfileName = styleArr[0].fileName
    if (!fontfileName) throw new Error(`${name}-${weight}-${style}, not found filename`)

    loadingRef.value = true
    let loadend = true
    try {
      await loadFontFamily(name, signal)
    } catch (error) {
      loadend = false
      throw error
    } finally {
      loadingRef.value = false
    }
    if (!loadend) return
    const weightNum = fontWeightMap[_weight]
    selected.eset({
      fontFamily: name,
      fontWeight: weightNum,
      fontStyle: _style
    })
  }
  function updateFontFamilyEqueue(name: FontFamilyName, weight: updateFontFamilyWeightParam) {
    beingLoadedRef.value = name
    const abortHandler = () => abortTask('abort by selected change')
    eventBus.addListener('fontFamily:load:cancel', abortHandler)
    enqueue(updateFontFamily, name, weight)
      .then(() => {
        beingLoadedRef.value = ''
      })
      .catch((error: Error) => {
        // 如果不是中断错误，抛出
        if (error?.cause !== AbortReason) {
          throw error
        }
      })
      .finally(() => {
        editorStore.setInloadingFontfamily(false)
        eventBus.off('fontFamily:load:cancel', abortHandler)
      })
  }
</script>

<template>
  <div class="fontTab">
    <div class="header">{{ loadingRef ? 'loading' : 'fonts' }}</div>
    <div class="content">
      <font-item
        v-for="familyName in familiesRef"
        :key="familyName"
        :selected="fontData.fontfamily === familyName"
        :being-loaded="beingLoadedRef === familyName"
        :weight="fontData.fontWeight"
        :font-name="familyName"
        :weight-list="[...new Set(fontInfo[familyName].map((familyInfo) => familyInfo.weight))] as FontWeight[]"
        @update:fontfamily="updateFontFamilyEqueue"
      ></font-item>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .fontTab {
    width: 100%;
    height: 100%;
  }
</style>
