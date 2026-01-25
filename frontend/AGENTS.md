# Agent Documentation - Frontend

This document outlines the standards and conventions for AI agents working on the EndInTiers frontend.

## Directory Structure
- `src/components/ui`: Small, reusable atomic components (buttons, inputs, etc.).
- `src/components/features`: Larger, feature-specific components built from UI primitives.
- `src/hooks`: Custom React hooks for business logic and state.
- `src/context`: React Context providers for global state (e.g., Socket, Auth).
- `src/types`: TypeScript interface and type definitions.

## Component Guidelines
1. **Consistency**: Always use components from `src/components/ui` for building features. If a primitive is missing, create it first.
2. **Styling**: Use Tailwind CSS for component-specific styles. Favor design tokens (variable-based colors/spacing) over hardcoded values.
3. **Purity**: Keep UI components as pure as possible. Business logic and side effects should reside in hooks or features.
4. **Naming**: Use PascalCase for component files and names (e.g., `Button.tsx`).
5. **Exports**: Use default exports for components.

## State Management
- **Local State**: Use `useState` for simple component-level state.
- **Game State**: Use the `useGame` hook for accessing and modifying the global game state.
- **Socket**: Access the socket instance via `useSocket` hook only.

## Best Practices
- **Early Returns**: Use early returns for conditional rendering and error handling.
- **Type Safety**: Avoid using `any`. Define clear interfaces for all props and state.
- **Documentation**: Briefly comment on complex logic or non-obvious design decisions.
