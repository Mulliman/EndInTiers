# EndInTiers

This repository contains the development of the **EndInTiers** application, a ranking and tier-list platform.

## Repository Structure

The project is divided into two main versions:

- **[v2](./v2/) (Active)**: The current, modernized version of the application. **This is the version that should always be updated.** It is built using React, Vite, and TypeScript.
- **[v1](./v1/) (Reference Only)**: The initial version of the app. This is kept for reference purposes and should generally not be modified.

## Version 2 (Current)

The active development happens in the `v2` directory.

### Key Files and Directories
- **[v2/src/](./v2/src/)**: Contains the React frontend components and logic.
  - **[App.tsx](./v2/src/App.tsx)**: Main application component and routing.
  - **[components/](./v2/src/components/)**: Reusable UI components.
- **[v2/server.ts](./v2/server.ts)**: Backend server logic (if applicable/integrated).
- **[v2/package.json](./v2/package.json)**: Project dependencies and scripts.

### Getting Started

To run the current version:
```bash
cd v2
npm install
npm run dev
```

---

*Note: For AI agents working on this project, please refer to [agents.md](./agents.md) for specific instructions.*
