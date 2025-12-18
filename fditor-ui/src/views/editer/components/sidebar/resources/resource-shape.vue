<script lang="ts" setup>
  import { EditorKey } from '@/constants/injectKey'
  import { FHexagon, FLine, FRect, FTriangle, type Editor } from '@fditor/core'
  import { inject } from 'vue'
  import shapeItem from '@/views/editer/components/sidebar/resources/components/shape-item.vue'
  import {
    Circle,
    FabricObject,
    type CircleProps,
    type Constructor,
    type RectProps,
    type SerializedLineProps
  } from 'fabric'
  import resourceHeader from '@/views/editer/components/sidebar/resources/components/resource-header.vue'

  const editor = inject(EditorKey) as Editor

  type ShapeName = 'Rect' | 'Circle' | 'Line' | 'Triangle' | 'Hexagon'

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
      name: 'Triangle',
      src: './shapes/tringle.svg'
    },
    {
      name: 'Hexagon',
      src: './shapes/hexagon.svg'
    },
    {
      name: 'five-pointed-star',
      src: './shapes/five-pointed-star.svg'
    },
    {
      name: 'Line',
      src: './shapes/line.svg'
    }
  ]

  const shapeFactory: Record<ShapeName, Constructor<FabricObject>> = {
    Circle: Circle,
    Rect: FRect,
    Line: FLine,
    Triangle: FTriangle,
    Hexagon: FHexagon
  }

  function addShape(name: ShapeName) {
    const config: Partial<CircleProps & RectProps & SerializedLineProps> = {
      fill: 'rgba(0, 255, 0, 1)',
      strokeWidth: 0
    }
    if (name === 'Circle') {
      config.radius = 200
    } else if (name === 'Line') {
      config.stroke = 'red'
      // const shape = new shapeFactory[name]([0, 300, 300, 300], config)
      const shape = new FLine({
        left: 100,
        top: 100,
        width: 100,
        height: 10,
        fill: 'rgba(255,0,0,1)'
      })
      editor.add(shape)
      // const line = new Line([100, 100, 200, 100], {
      //   stroke: 'blue',
      //   strokeWidth: 10,
      //   strokeUniform: true
      // })
      // editor.add(line)
      return
    } else if (name === 'Rect') {
      const shape = new FRect({
        fill: 'rgba(255,0,0,1)',
        left: 100,
        top: 100,
        width: 400,
        height: 200
        // cornerRadius: 20
      })
      editor.add(shape)
      return
    } else if (name === 'Triangle') {
      const shape = new FTriangle({
        fill: 'rgba(255,0,0,1)',
        left: 100,
        top: 100,
        width: 300,
        height: 300
        // cornerRadius: 20
      })
      editor.add(shape)
      return
    } else if (name === 'Hexagon') {
      const shape = new FHexagon({
        fill: 'rgba(255,0,0,1)',
        left: 100,
        top: 100
        // cornerRadius: 20
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
  <div class="resourceShapeBox">
    <resource-header title="Shape"></resource-header>
    <div class="content-block">
      <div class="section">
        <div class="section-title">Basic</div>
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
      <div class="section">
        <div class="section-title">Markers</div>
        <div class="content-placeholder"> </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .resourceShapeBox {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb; // Light background similar to resource-menu.vue

    .content-block {
      width: 100%;
      flex: 1;
      padding: 8px; // Add padding to create breathing space
      overflow-y: auto; // Ensure scrollability

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
        }

        .content-placeholder {
          width: 100%;
          min-height: 80px;
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        }
      }
    }
  }
</style>
