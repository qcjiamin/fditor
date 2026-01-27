<script lang="ts" setup>
  import { useFloating, shift, autoUpdate, offset, flip } from '@floating-ui/vue'
  import { computed, nextTick, ref } from 'vue'
  import { watch } from 'vue'
  interface IPropertyItemProps {
    tip?: string
    shortcut?: string
    showBorder?: boolean
    disabled?: boolean
  }
  const open = ref(false)
  const { tip = '', shortcut = '', showBorder = false, disabled = false } = defineProps<IPropertyItemProps>()
  const anchor = ref<HTMLDivElement>()
  const popRef = ref<HTMLDivElement>()
  const { floatingStyles, update, placement } = useFloating(anchor, popRef, {
    placement: 'top', // 默认上方，或者由外面传入
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate
  })
  const showTip = computed(() => {
    if (disabled) {
      return false
    }
    return open.value
  })

  async function toggleOpen(val: boolean) {
    open.value = val
  }
  watch(open, async (newVal) => {
    if (newVal) {
      await nextTick()
      update()
    }
  })
</script>

<template>
  <div
    ref="anchor"
    class="anchorBox"
    :class="{ active: showTip, showBorder: showBorder }"
    @mouseenter="toggleOpen(true)"
    @mouseleave="toggleOpen(false)"
  >
    <slot name="anchor"></slot>
  </div>
  <Teleport to="body">
    <div ref="popRef" :class="['popupTip', { active: showTip }]" :style="floatingStyles" :data-placement="placement">
      <slot name="popup">
        <!-- 默认内容 -->
        <div class="tooltip">
          <span class="label">{{ tip }}</span>
          <span class="shortcut">{{ shortcut }}</span>
        </div>
      </slot>
    </div>
    <!-- </pallet-mask> -->
  </Teleport>
</template>

<style scoped lang="scss">
  .popupTip {
    z-index: 30;
    &.active .tooltip {
      visibility: visible;
      opacity: 1;
    }
    .tooltip {
      background-color: #1f2937; /* Dark gray/black bg */
      color: #ffffff;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      /* Little arrow pointing down */
      &::after {
        content: '';
        position: absolute;
        border-width: 4px;
        border-style: solid;
      }
      .label {
        font-weight: 500;
      }
      .shortcut {
        color: #9ca3af; /* Light gray for shortcut */
        font-size: 11px;
      }
    }

    // 根据 placement 动态调整箭头位置
    &[data-placement^='top'] .tooltip::after {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-color: #1f2937 transparent transparent transparent;
    }

    &[data-placement^='bottom'] .tooltip::after {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-color: transparent transparent #1f2937 transparent;
    }

    &[data-placement^='left'] .tooltip::after {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-color: transparent transparent transparent #1f2937;
    }

    &[data-placement^='right'] .tooltip::after {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-color: transparent #1f2937 transparent transparent;
    }
  }
</style>
