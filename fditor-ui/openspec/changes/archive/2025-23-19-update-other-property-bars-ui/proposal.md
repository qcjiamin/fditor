# Change: Update Other Property Bar UI Components with Figma-inspired Design

## Why
Following the successful UI optimization of text-bar.vue and its child components, we need to extend the Figma-inspired design to other property bar components in the editor. This will provide a consistent, modern UI experience across all property controls in the editor. The optimization should maintain all existing functionality while delivering a more polished, professional appearance that matches the design language established in the text-bar.vue update.

## What Changes
- Update activeSelection-bar.vue to follow Figma's design language with cleaner, more minimalist UI
- Update bg-bar.vue with refined visual appearance matching Figma style
- Update group-bar.vue with consistent Figma-inspired design
- Update history-box.vue with modern UI elements following Figma principles
- Update image-bar.vue with improved layout and styling
- Update public-bar.vue with cleaner design and enhanced visual hierarchy
- Update shape-bar.vue with refined visual appearance
- Update clip-bar.vue with consistent Figma-inspired styling
- Update sub-components of the above bars with Figma-inspired design
  - imageBar/flip-box.vue
  - publicBar/position-box.vue
  - publicBar/opacity-property.vue
  - publicBar/position-property.vue
  - shapeBar/radius-box.vue
  - shapeBar/radius-property.vue
  - imageBar/flip-property.vue
  - components/stroke-box.vue
  - components/stroke-property.vue
- Exclude any shared components with text-bar.vue (e.g., property-item.vue, property-normal-item.vue, fill-property.vue, property-fontfamily-item.vue) to avoid duplication and maintain consistency
- Maintain all existing functionality and component interfaces

## Impact
- Affected specs: None (UI enhancement only)
- Affected code:
  - src/views/editer/components/propertyBar/activeSelectionBar/activeSelection-bar.vue
  - src/views/editer/components/propertyBar/bgBar/bg-bar.vue
  - src/views/editer/components/propertyBar/groupBar/group-bar.vue
  - src/views/editer/components/propertyBar/historyBar/history-box.vue
  - src/views/editer/components/propertyBar/imageBar/image-bar.vue
  - src/views/editer/components/propertyBar/imageBar/flip-box.vue
  - src/views/editer/components/propertyBar/imageBar/flip-property.vue
  - src/views/editer/components/propertyBar/publicBar/public-bar.vue
  - src/views/editer/components/propertyBar/publicBar/opacity-property.vue
  - src/views/editer/components/propertyBar/publicBar/position-property.vue
  - src/views/editer/components/propertyBar/publicBar/position-box.vue
  - src/views/editer/components/propertyBar/shapeBar/shape-bar.vue
  - src/views/editer/components/propertyBar/shapeBar/radius-property.vue
  - src/views/editer/components/propertyBar/shapeBar/radius-box.vue
  - src/views/editer/components/propertyBar/clip-bar.vue
  - src/views/editer/components/propertyBar/components/stroke-property.vue
  - src/views/editer/components/propertyBar/components/stroke-box.vue
- Visual appearance of property controls will change significantly to match Figma's design language
- All functionality remains identical