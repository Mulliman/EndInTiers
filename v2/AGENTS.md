# Assistant Instructions: It All Ends In Tiers

This file contains persistent context and rules for the AI coding agent working on this project.

## Project Context
"It All Ends In Tiers" is a real-time multiplayer tier-ranking party game.

## Technical Architecture
- **Full-Stack**: Express server (`server.ts`) handles both API/Socket logic and serves the Vite frontend.
- **State Management**: Game state is held in-memory on the server in a `rooms` Map.
- **Communication**: Socket.io handles all events (LOBBY -> SELECTING -> RANKING -> RESULTS).
- **Styling**: Tailwind CSS v4 with custom theme colors for tiers (S-D).

## File Structure Conventions
- `server.ts`: Entry point for the backend logic and socket handlers.
- `src/App.tsx`: Main entry point for the frontend, handles higher-level routing/state based on room updates.
- `src/components/`: Modular UI components for each game state.
- `src/lib/data.ts`: Contains the hardcoded categories, subcategories, and topics.
- `src/lib/socket.ts`: Singleton for the client-side socket connection.

## Game Logic Rules
- **Room Code**: 4-character alphanumeric string.
- **Max Players**: 8 players per room.
- **Scoring**:
  - Distance = `Math.abs(playerIndex - chooserIndex)` for each item.
  - Round Score = `Math.max(0, 100 - (totalDistance * 10))`.
  - Maximum possible round score is 100.
- **Tiers**:
  - S-Tier: Red (#FF4B4B)
  - A-Tier: Orange (#FF8F3F)
  - B-Tier: Yellow (#FFD338)
  - C-Tier: Green (#4BD663)
  - D-Tier: Blue (#3F9CFF)

## Design Guidelines (Bento Grid)
- Use `.bento-card` utility for containers (24px padding, 24px radius, subtle border).
- Use `.label-caps` for small, uppercase helper text.
- Maintain dark theme with `rgba(255, 255, 255, 0.05)` surfaces.
- Animation: Use `motion` for state transitions and drag-and-drop feedback.

## Implementation Notes
- Always sanity check the `Room` object structure in both `server.ts` and `App.tsx` when adding state properties.
- When adding new categories, ensure they have at least 7-12 items to provide variety for the Chooser (who picks exactly 5).
- Socket events should always be capitalized (e.g., `START_GAME`, `SUBMIT_RANKING`).
