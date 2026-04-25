# Agent Instructions: EndInTiers Repository

This repository contains multiple versions of the EndInTiers application. 

## Primary Instruction

**You must always work within the `v2/` directory.**

- **Version 2 (`/v2`)**: The current production-ready version. All feature requests, bug fixes, and architectural improvements should be implemented here.
- **Version 1 (`/v1`)**: Legacy code kept strictly for reference or migration purposes. **Do not modify files in `v1` or `old/`** unless explicitly instructed to do so by the user.

## Working with Version 2

When performing tasks in the `v2` directory, please adhere to the following:

1.  **Technical Stack**: React, Vite, TypeScript, Express, Socket.io, and Tailwind CSS v4.
2.  **Core Files**:
    - [v2/server.ts](./v2/server.ts) (Backend/Sockets)
    - [v2/src/App.tsx](./v2/src/App.tsx) (Frontend Routing/State)
    - [v2/src/lib/data.ts](./v2/src/lib/data.ts) (Content/Topics)
3.  **Detailed Specs**: For specific game logic, scoring rules, and design guidelines, consult the **[v2/AGENTS.md](./v2/AGENTS.md)** file.

## Reference Paths

- Active Source: [./v2/src/](./v2/src/)
- Active Server: [./v2/server.ts](./v2/server.ts)
- Active Assets: [./v2/public/](./v2/public/)

---

*Found a bug or need to add a feature? Ensure you are in the `v2` folder before starting.*
