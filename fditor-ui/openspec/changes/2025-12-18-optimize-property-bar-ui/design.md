# Design: Property Bar UI Optimization

## Design Principles
- **Minimalism**: Clean, uncluttered interfaces with purposeful elements
- **Consistency**: Uniform spacing, sizing, and interaction patterns
- **Visual Hierarchy**: Clear distinction between primary and secondary controls
- **Figma-inspired Aesthetics**: Light-on-dark theme, subtle shadows, and rounded corners

## Visual Specifications

### Color Palette
- Primary background: #f5f5f7 (light grey)
- Secondary background: #ffffff (white)
- Hover state: rgba(64, 87, 109, 0.07) → Updated to lighter neutral
- Active state: rgba(57, 76, 96, 0.15) → Updated for better contrast
- Border color: light grey with subtle shadow instead of harsh borders
- Text: Use dark colors for better readability (#333 or similar)

### Sizing & Spacing
- Base unit: 4px grid system
- Component height: 36px (from current 30px) for better touch targets
- Padding: 8px internally (from current 5px)
- Gap between items: 8px (from current 5px)
- Border radius: 4px (from current 2px) for softer appearance

### Component States
- **Default**: Subtle background, minimal styling
- **Hover**: Light background color change to indicate interactivity
- **Active/Selected**: More pronounced background to indicate selection
- **Disabled**: Reduced opacity to indicate inactive state

### Typography
- Font size: Maintain readable size (use system fonts where possible)
- Weight: Use medium weight for active controls to increase prominence

## Architecture Considerations

### CSS Strategy
- Utilize SCSS for maintainable styling
- Create reusable variables for colors, spacing, and typography
- Implement a utility class system for common states
- Use scoped styles to prevent global conflicts

### Component Structure
- Maintain existing component structure to preserve functionality
- Update only `.anchorBox` and related classes with new design
- Ensure Teleport components maintain new styling
- Preserve slot-based architecture for flexibility

## Interaction Design
- Maintain current click/toggle interactions
- Preserve tooltip functionality
- Keep popup/mask behavior unchanged
- Maintain keyboard navigation patterns

## Accessibility Considerations
- Ensure sufficient color contrast ratios
- Maintain focus indicators
- Preserve screen reader compatibility
- Keep touch targets at minimum 44px