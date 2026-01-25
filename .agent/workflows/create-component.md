---
description: How to create a new reusable UI component in the frontend.
---

# Create Component Workflow

Use this workflow to create new components in the appropriate tier (`atoms` or `modules`).

## Tier Selection
- **Atoms**: Basic building blocks (e.g., `Badge`, `Icon`, `Tooltip`).
- **Modules**: Combinations of atoms with feature-specific layout (e.g., `PlayerRow`, `WordGrid`, `TierList`).

## Steps
1. **Check Existing**: Verify the component doesn't exist in either `atoms` or `modules`.
2. **Define Props**: Create an interface for props. For modules, include relevant game data props.
3. **Implement**: Create the file in `src/components/[atoms|modules]/[ComponentName].tsx`.
4. **Style**: Use Tailwind CSS. For modules, try to abstract as much "noise" as possible from the higher-level phases.
5. **Export**: Export the component as default.

## Template

```tsx
import React from 'react';

interface ComponentNameProps {
  children?: React.ReactNode;
  className?: string;
  // add other props here
}

export default function ComponentName({ children, className = '', ...props }: ComponentNameProps) {
  return (
    <div className={`base-styles ${className}`} {...props}>
      {children}
    </div>
  );
}
```
