# Change: Update Text Property Bar UI Components with Figma-inspired Design

## Why
The current text property bar components (text-bar.vue and its child components) use a default UI design that doesn't follow modern design standards. We need to enhance the UI to follow Figma's clean, minimalist design principles, improving user experience and visual consistency with industry-standard design tools. The optimization should maintain all existing functionality while delivering a more polished, professional appearance.

## What Changes
- Update text-bar.vue to follow Figma's design language with cleaner, more minimalist UI
- Redesign spacing-property.vue with improved layout and interaction according to Figma's design system
- Enhance align-property.vue with refined alignment controls that match Figma's aesthetic
- Modernize spacing-box.vue with enhanced slider controls and more intuitive layout
- Improve align-box.vue with cleaner alignment options and better visual feedback
- Update all underlying property components used by text-bar.vue with consistent Figma-inspired design:
  - property-fontfamily-item.vue
  - fill-property.vue
  - property-normal-item.vue
  - colorBox/color-box.vue
  - colorPicker/color-picker.vue
  - colorPicker/hex-input.vue
  - colorPicker/rgb-input.vue
  - gradientPicker/gradient-picker.vue
- Maintain all existing functionality and component interfaces

## Impact
- Affected specs: None (UI enhancement only)
- Affected code: 
  - src/views/editer/components/propertyBar/textBar/text-bar.vue
  - src/views/editer/components/propertyBar/textBar/spacing-property.vue
  - src/views/editer/components/propertyBar/textBar/align-property.vue
  - src/views/editer/components/propertyBar/textBar/spacing-box.vue
  - src/views/editer/components/propertyBar/textBar/align-box.vue
  - src/views/editer/components/propertyBar/components/property-fontfamily-item.vue
  - src/views/editer/components/propertyBar/components/fill-property.vue
  - src/views/editer/components/propertyBar/components/property-normal-item.vue
  - src/components/colorBox/color-box.vue
  - src/components/colorPicker/color-picker.vue
  - src/components/colorPicker/hex-input.vue
  - src/components/colorPicker/rgb-input.vue
  - src/components/gradientPicker/gradient-picker.vue
- Visual appearance of text property controls will change significantly
- All functionality remains identical