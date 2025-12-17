# Change: Update Editor Header UI with Figma-inspired Minimalist Design

## Why
The current editor header UI lacks the minimalist, clean aesthetic of Figma's interface. Users expect modern, streamlined interfaces that focus on content creation without visual distractions. The current design has a more traditional UI look that could benefit from a more contemporary, Figma-inspired approach while maintaining all current functionality.

## What Changes
- Redesign the editer-header.vue component with a minimalist Figma-inspired aesthetic
- Apply similar styling patterns from resource-menu.vue for consistency
- Maintain all existing functionality including:
  - Project name display
  - Save state indicator
  - Layout selection dropdown
  - Preview button
- Use a cleaner, more subtle color palette
- Improve spacing and typographic hierarchy following Figma's design principles
- Ensure the UI remains intuitive and usable

## Impact
- Affected spec: None (this is a UI enhancement)
- Affected code: 
  - src/views/editer/components/editer-header.vue
  - Potentially global styles that support the new design
- Visual impact: The header UI will have a more modern, minimalist appearance following Figma's design language
- Functional impact: Zero functional impact - all existing functionality will remain intact