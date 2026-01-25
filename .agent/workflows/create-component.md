---
description: How to create a new reusable UI component in the frontend.
---

# Create Component Workflow

Use this workflow when you need to create a new atomic UI component in `src/components/ui`.

## Steps

1. **Check Existing**: First, verify that a similar component doesn't already exist in `src/components/ui`.
2. **Define Props**: Create an interface for the component props. Include standard props like `className` and `children` where appropriate.
3. **Implement**: Create the component file in `src/components/ui/[ComponentName].tsx`.
4. **Style**: Use Tailwind CSS, ensuring it follows the established design aesthetic (vibrant, modern, glassmorphism if applicable).
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
