## MODIFIED Requirements

### Requirement: Editor Header UI Aesthetic
The editor header UI SHALL follow a minimalist, Figma-inspired design language while preserving all existing functionality. The visual appearance SHALL be clean, uncluttered, and focused on usability with subtle color palette and appropriate spacing.

#### Scenario: Clean, Minimalist Appearance
- **WHEN** user views the editor header
- **THEN** the header displays in a clean, minimalist style inspired by Figma's design language
- **THEN** the header maintains clear visual hierarchy without unnecessary visual elements

#### Scenario: Consistent Design Language
- **WHEN** user compares the header with other components like resource-menu.vue  
- **THEN** the header follows similar styling patterns for visual consistency

#### Scenario: Preserved Functionality
- **WHEN** user interacts with header elements
- **THEN** all existing functionality continues to work as expected (project name display, layout selection, preview button, save state indicator)

### Requirement: Editor Header Layout
The editor header SHALL maintain its current three-section layout (left, center, right) with the project name and save state on the left, layout selector in the center, and preview button on the right. The layout SHALL be responsive and maintain proper alignment.

#### Scenario: Proper Section Arrangement
- **WHEN** user views the editor header
- **THEN** the left section contains project name and save state indicator
- **THEN** the center section contains layout selection control
- **THEN** the right section contains preview button

## ADDED Requirements

### Requirement: Figma-inspired Aesthetic Properties
The editor header UI SHALL implement aesthetic properties consistent with Figma's design principles, including but not limited to subtle shadows, appropriate color contrasts, refined typography, and minimalist control elements.

#### Scenario: Minimalist Control Elements
- **WHEN** user sees dropdown menus or buttons in the header
- **THEN** these elements appear with a minimalist design that does not distract from the main workspace
- **THEN** interactive elements have clear hover and selection states

### Requirement: Visual Consistency with Sidebar Components
The editor header SHALL maintain visual consistency with sidebar components, specifically taking design cues from resource-menu.vue, including similar color schemes, spacing, and element styling.

#### Scenario: Consistent Styling with Sidebars
- **WHEN** user compares the header with sidebar components like resource-menu.vue
- **THEN** the visual styling shows clear consistency in colors, spacing, and component design