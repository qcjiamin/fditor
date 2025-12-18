# Change: Update Resource Components UI with Figma-inspired Minimalist Design

## Why
The current resource components (resource-image.vue, resource-text.vue, etc.) have a more traditional UI design that lacks the minimalist, clean aesthetic found in modern design tools like Figma. Users expect modern, streamlined interfaces that focus on content creation without visual distractions. The current design could benefit from a more contemporary, Figma-inspired approach while maintaining all current functionality.

## What Changes
- Redesign all resource-*.vue components with a minimalist Figma-inspired aesthetic
- Apply similar styling patterns from resource-menu.vue and the recently updated editor-header.vue for consistency
- Maintain all existing functionality including:
  - Resource display and selection
  - Search functionality (for image/video components)
  - Add element functionality
  - All interactive elements and behaviors
- Use a cleaner, more subtle color palette similar to Figma's interface
- Improve spacing, typography, and visual hierarchy following Figma's design principles
- Ensure the UI remains intuitive and usable

## Impact
- Affected specs: None (this is a UI enhancement)
- Affected code:
  - src/views/editer/components/sidebar/resources/resource-image.vue
  - src/views/editer/components/sidebar/resources/resource-text.vue
  - src/views/editer/components/sidebar/resources/resource-shape.vue
  - src/views/editer/components/sidebar/resources/resource-video.vue
  - src/views/editer/components/sidebar/resources/resource-layer.vue
  - src/views/editer/components/sidebar/resources/resource-upload.vue
  - src/views/editer/components/sidebar/resources/components/resource-header.vue
- Visual impact: The resource components will have a more modern, minimalist appearance following Figma's design language
- Functional impact: Zero functional impact - all existing functionality will remain intact