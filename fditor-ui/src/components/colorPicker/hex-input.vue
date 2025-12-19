<script lang="ts" setup>
  // const emit = defineEmits(['tabChange'])
  const props = defineProps<{
    value: string
    updateValue: (val: string) => void
  }>()
  function inputHandle(e: Event) {
    const ipt = e.target as HTMLInputElement
    // 检查是否符合hex颜色值规范，如果不符合，恢复为FFFFFF
    // 只允许输入 0-9、a-f、A-F，长度最多 7
    let val = ipt.value
    // 转大写
    val = val.toUpperCase()
    const max = Math.min(val.length, 6)
    val = val.slice(0, max).replace(/[^0-9a-fA-F]/g, '')
    ipt.value = val
  }

  function changeHandle(e: Event) {
    const ipt = e.target as HTMLInputElement
    // 检查是否符合hex颜色值规范，如果不符合，恢复为#FFFFFF
    // 只允许输入 0-9、a-f、A-F，长度最多 6
    let val = ipt.value
    // 长度为6
    if (val.length < 6) {
      val = 'FFFFFF'
      //! 如果本身是FFFFFF， 删一个F，退出，那么得到的值还是FFFFFF，不会触发重新渲染的逻辑，会让这里显示成5个F
      ipt.value = val
    }

    props.updateValue('#' + val)
  }
</script>

<template>
  <div class="hexbox">
    <input type="text" :value="props.value" placeholder="RRGGBB" @input="inputHandle" @change="changeHandle" />
  </div>
</template>

<style scoped lang="scss">
  .hexbox {
    width: 100%;
    height: 32px;
    display: flex;

    input {
      padding: 6px 12px;
      font-size: 13px;
      width: 100%;
      border-radius: 6px;
      outline: none;
      border: 1px solid #e0e0e0;
      background-color: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      &:hover {
        border-color: #d0d0d0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }
</style>
