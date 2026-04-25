# Agent Documentation - Frontend

This document outlines the standards and conventions for AI agents working on the EndInTiers frontend.

## Directory Structure
- `src/components/atoms`: Stateless, reusable primitive components (Button, Input, Card, Container, Badge).
- `src/components/modules`: Compositional UI patterns (PlayerList, OptionGrid, PhaseHeader, TierRow). Modules handle layout and specific styling, keeping Phases clean.
- `src/components/phases`: High-level game screens (Lobby, Selection, Ranking, Results). Phases manage game state logic and compose modules.
- `src/hooks`: Custom React hooks for business logic and state.
- `src/context`: React Context providers for global state.
- `src/types`: TypeScript definitions.

## Component Guidelines
1. **Consistency**: Use Atoms to build Modules, and Modules to build Phases.
2. **Styling**: Modules should contain the majority of Tailwind CSS for specific UI features. Phases should be declarative and nearly free of inline styling.
3. **Purity**: Atoms must be stateless. Modules should favor props for state. Phases manage the primary game state.
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
