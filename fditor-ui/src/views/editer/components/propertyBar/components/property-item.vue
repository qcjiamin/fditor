<script lang="ts" setup generic="T">
  // import { ref, watch, reactive, nextTick, onMounted } from 'vue'
  import { nextTick, ref, watch } from 'vue'
  import palletMask from '@/views/editer/components/propertyBar/components/pallet-mask.vue'
  import { onClickOutside } from '@vueuse/core'
  import { useFloating, shift, autoUpdate } from '@floating-ui/vue'

  const open = ref(false)
  // const emit = defineEmits(['update:val'])

  // 泛型组件
  // interface IPropertyItemProps {
  //   val: T
  //   tip?: string
  // }

  interface IPropertyItemProps {
    tip?: string
    showBorder?: boolean
  }

  // onMounted(() => {
  //   const {floatingStyles, update} = useFloating(anchor, popRef, {
  //     whileElementsMounted: autoUpdate
  //   })
  // })

  const { tip = '', showBorder = false } = defineProps<IPropertyItemProps>()
  const anchor = ref<HTMLDivElement>()
  const popRef = ref<HTMLDivElement>()

  const { floatingStyles, update } = useFloating(anchor, popRef, {
    middleware: [shift()],
    whileElementsMounted: autoUpdate
  })

  async function toggleOpen() {
    open.value = true
  }
  //! focus能监听到浏览器以外的点击
  onClickOutside(popRef, () => {
    open.value = false
  })

  watch(open, async (newVal) => {
    if (newVal) {
      await nextTick()
      update()
    }
  })
</script>

<template>
  <el-tooltip :content="tip" :disabled="tip === ''">
    <div ref="anchor" class="anchorBox" :class="{ active: open, showBorder: showBorder }" @click="toggleOpen">
      <slot name="anchor"></slot>
    </div>
  </el-tooltip>
  <Teleport to="body">
    <pallet-mask v-if="open">
      <!-- <div ref="popRef" class="popup" :style="{ left: popStyle.left, top: popStyle.top }"> -->
      <div ref="popRef" class="popup" :style="floatingStyles">
        <slot name="popup"></slot>
      </div>
    </pallet-mask>
  </Teleport>
</template>

<style scoped lang="scss">
  .anchorBox {
    width: 36px;
    height: 36px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px; // Softer rounded corners following Figma's design
    transition: background-color 0.2s ease; // Smooth transitions for better UX

    &.showBorder {
      box-sizing: border-box;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08); // Subtle border instead of grey outline
    }

    &:hover {
      background-color: rgba(64, 87, 109, 0.08); // Slightly more pronounced hover effect
    }

    &.active {
      background-color: rgba(57, 76, 96, 0.16); // Slightly more pronounced active state
    }
  }

  .popup {
    outline: none;
    position: absolute;
    z-index: 30;
    border-radius: 8px; // More pronounced rounded corners for modals
    padding: 12px;
    background-color: #ffffff;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 8px 24px rgba(0, 0, 0, 0.12); // Multi-layered shadow for depth as used in Figma
    border: 1px solid rgba(0, 0, 0, 0.08); // Subtle border for additional refinement
  }
</style>
