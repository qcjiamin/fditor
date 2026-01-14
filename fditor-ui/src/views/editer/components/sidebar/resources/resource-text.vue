<script lang="ts" setup>
  import { FTextBox } from '@fditor/core'
  import { FabricObject } from 'fabric'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'
  import { useAddAndDeleteElement } from '@/stores/commands/useAddAndRemoveElement'

  const { addElement } = useAddAndDeleteElement()
  function addText() {
    const text = new FTextBox('TEXT', {
      fontFamily: 'Noto Sans',
      fontSize: 100
    })
    addElement(text as FabricObject)
  }
</script>

<template>
  <div class="resource-container">
    <resource-header title="Text"></resource-header>
    <div class="content-block">
      <div class="section">
        <div class="section-title">Default</div>
        <div class="content">
          <div class="text-item" @click="addText">
            <div class="text-preview">Default Text</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Text Combinations</div>
        <div class="content">
          <div class="text-item-placeholder"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .section {
    width: 100%;
    margin-bottom: 16px; // Increased spacing between sections

    .section-title {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280; // Muted title color
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      padding-left: 4px;
    }

    .content {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 8px; // Consistent spacing

      .text-item {
        width: calc(50% - 4px); // Two columns with proper spacing
        min-height: 70px;
        border-radius: 6px;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow
        border: 1px solid #e5e7eb; // Subtle border

        &:hover {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06); // Figma-style hover effect
          border-color: #d1d5db; // Slightly more prominent border on hover
          transform: translateY(-1px); // Subtle lift effect
        }

        .text-preview {
          color: #374151; // Readable text color
          padding: 8px;
          text-align: center;
          width: 100%;
        }
      }

      .text-item-placeholder {
        width: calc(50% - 4px);
        min-height: 70px;
        border-radius: 6px;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed #d1d5db; // Dashed border for placeholder
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // Subtle shadow

        &:hover {
          border-style: solid;
          border-color: #9ca3af; // More solid border on hover
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      }
    }
  }
</style>
