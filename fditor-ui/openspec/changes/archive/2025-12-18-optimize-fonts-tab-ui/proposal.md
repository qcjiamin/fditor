# Change: Optimize fonts-tab.vue and font-item.vue UI Components with Figma-inspired Minimalist Design

## Why
The current fonts-tab.vue and its associated font-item.vue component have a more traditional UI design that lacks the minimalist, clean aesthetic found in modern design tools like Figma. To maintain consistency across the UI components and provide a more streamlined user experience, these components should be redesigned to match the style of the resource-*.vue series components which follow a Figma-inspired design language. The optimization should maintain all existing functionality and state management while improving visual aesthetics.

## What Changes
- Redesign fonts-tab.vue with a minimalist Figma-inspired aesthetic similar to resource components
- Redesign font-item.vue to follow the same visual style as resource components
- Apply consistent styling patterns from resource-menu.vue and resource-header.vue for visual harmony
- Maintain all existing functionality including:
  - Font family selection
  - Font weight selection
  - Loading states
  - Visual feedback for selected items
  - All interactive behaviors and state management
- Use a cleaner, more subtle color palette similar to Figma's interface
- Improve spacing, typography, and visual hierarchy following Figma's design principles
- Ensure the UI remains intuitive and usable with the same user experience flow

## Impact
- Affected specs: New specifications will be added to define the updated UI behavior
- Affected code:
  - src/views/editer/components/sidebar/tabs/fonts/fonts-tab.vue
  - src/views/editer/components/sidebar/tabs/fonts/components/font-item.vue
- Visual impact: The font selection components will have a more modern, minimalist appearance following Figma's design language, consistent with other resource components
- Functional impact: Zero functional impact - all existing functionality will remain intact, ensuring backward compatibility