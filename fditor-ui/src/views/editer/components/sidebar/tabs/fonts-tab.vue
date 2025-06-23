<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { useEditorStore } from '@/stores/editorStore'
  import { Textbox } from 'fabric'
  import { inject, reactive, ref } from 'vue'
  import fontItem from '@/views/editer/components/sidebar/tabs/font-item.vue'
  import { fontInfo } from '@/utils/fontinfo'
  import { fontWeightMap, FontWeightReverseMap, type FontWeightKey } from '@/utils/constants'
  import type { FontFamilyName } from '@/utils/types'
  import { useGetAttrs } from '@/hooks/useGetAttrs'
  //todo: 确定 props 改变，是否会影响 openRef 的值

  const editorStore = useEditorStore()
  const selected = editorStore.selected

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const editor = inject(EditorKey)
  interface FontData {
    fontfamily: string
    fontWeight: FontWeightKey
  }
  const fontData: FontData = reactive({
    fontfamily: '',
    fontWeight: 'regular'
  })
  const familiesRef = ref(Object.keys(fontInfo) as FontFamilyName[])

  function getFontData() {
    if (!selected) throw new Error('mounted fontsTab')
    if (!(selected instanceof Textbox)) throw new Error('mounted fontsTab, selected is not textbox')
    fontData.fontfamily = selected.fontFamily
    fontData.fontWeight = FontWeightReverseMap[selected.fontWeight as number]
    console.log(selected.fontFamily)
  }
  useGetAttrs(getFontData)

  function updateFontFamily(name: FontFamilyName, weight: FontWeightKey) {
    if (!selected) throw new Error('mounted fontsTab')
    if (!(selected instanceof Textbox)) throw new Error('mounted fontsTab, selected is not textbox')
    const weightNum = fontWeightMap[weight]
    // 加载字体
    selected.eset({
      fontFamily: name,
      fontWeight: weightNum
    })
    // 1.修改完成后重新获取属性，能自动监听吗？
    // 2. 如果是异步任务，如何处理？
    // getFontData()
  }
</script>

<template>
  <div class="fontTab">
    <div class="header">fonts</div>
    <div class="content">
      <font-item
        v-for="familyName in familiesRef"
        :key="familyName"
        :selected="fontData.fontfamily === familyName"
        :weight="fontData.fontWeight"
        :font-name="familyName"
        :weight-list="Object.keys(fontInfo[familyName]) as FontWeightKey[]"
        @update:fontfamily="updateFontFamily"
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
