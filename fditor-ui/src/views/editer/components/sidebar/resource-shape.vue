<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { FLine, FPath, type Editor } from '@fditor/core'
  import { inject } from 'vue'
  import shapeItem from '@/views/editer/components/sidebar/shape-item.vue'
  import {
    Circle,
    FabricObject,
    Rect,
    type CircleProps,
    type Constructor,
    type RectProps,
    type SerializedLineProps
  } from 'fabric'

  const editor = inject(EditorKey) as Editor
  console.error(editor)

  type ShapeName = 'Rect' | 'Circle' | 'Line' | 'Path'

  const shapes = [
    {
      name: 'Circle',
      src: './shapes/circle.svg'
    },
    {
      name: 'Rect',
      src: './shapes/rect.svg'
    },
    {
      name: 'tringle',
      src: './shapes/tringle.svg'
    },
    {
      name: 'pentagon',
      src: './shapes/pentagon.svg'
    },
    {
      name: 'five-pointed-star',
      src: './shapes/five-pointed-star.svg'
    },
    {
      name: 'Line',
      src: './shapes/five-pointed-star.svg'
    },
    {
      name: 'Path',
      src: './shapes/five-pointed-star.svg'
    }
  ]

  const shapeFactory: Record<ShapeName, Constructor<FabricObject>> = {
    Circle: Circle,
    Rect: Rect,
    Line: FLine,
    Path: FPath
    // Line: FPath
  }

  function addShape(name: ShapeName) {
    const config: Partial<CircleProps & RectProps & SerializedLineProps> = {
      fill: 'rgba(0, 255, 0, 1)',
      strokeWidth: 0
    }
    if (name === 'Circle') {
      config.radius = 200
    }
    if (name === 'Line') {
      config.stroke = 'red'
      // const shape = new shapeFactory[name]([0, 300, 300, 300], config)
      const shape = new FLine({
        left: 100,
        top: 100,
        width: 100,
        height: 10,
        fill: 'red'
      })
      editor.add(shape)
      // const line = new Line([100, 100, 200, 100], {
      //   stroke: 'blue',
      //   strokeWidth: 10,
      //   strokeUniform: true
      // })
      // editor.add(line)
      return
    } else if (name === 'Path') {
      const shape = new FPath('M 0 0 H 300 V 100 H0 Z', {
        fill: 'red',
        left: 100,
        top: 100,
        cornerRadius: 20
      })
      editor.add(shape)
      return
    } else {
      config.width = 300
      config.height = 300
    }

    const shape = new shapeFactory[name](config)
    editor.add(shape)
  }
</script>

<template>
  <div class="resouceShapeBox">
    <div class="block">
      <div class="title">基本</div>
      <div class="content">
        <shape-item
          v-for="item in shapes"
          :key="item.name"
          :name="item.name"
          :url="item.src"
          @click="addShape(item.name as ShapeName)"
        ></shape-item>
      </div>
    </div>
    <div class="block">
      <div class="title">标记</div>
      <div class="box"> </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resouceShapeBox {
    padding: 8px 0 16px 16px;
    width: 100%;
    background-color: $TAB_BGCOLOR;
    height: 100%;
    display: flex;
    flex-direction: column;
    .block {
      width: 100%;
      margin-bottom: 1rem;
      .title {
        color: $TAB_TITLE_COLOR;
        font-size: $TAB_TITLE_FONTSIZE;
        margin-bottom: 7px;
      }
      .content {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }
  }
</style>
