# It All Ends In Tiers

A real-time, browser-based multiplayer party game based on tier ranking. Players guess how the "Chooser" will rank selective items, leading to hilarious arguments and subjective debates.

## 🎮 Game Concept
"It All Ends In Tiers" leverages the popular tier-ranking format into a social guessing game. Each round, one player becomes the Chooser. They pick a topic and 5 items, then rank them secretly. Everyone else tries to match that ranking to earn points.

## 🚀 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS (v4), Motion (for animations).
- **Backend**: Node.js, Express.
- **Real-time**: Socket.io (WebSockets).
- **Drag & Drop**: @dnd-kit (for the tier list interactions).

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   *Note: This starts the Express server which serves the Vite middleware.*

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

## 🌐 Deployment Guide

### Why not Netlify or Vercel?
While Netlify is great for static sites, this application requires a **persistent Node.js server** to handle WebSocket connections and in-memory game state. Netlify Functions (Serverless) are stateless and do not support the long-lived connections needed for real-time multiplayer gaming.

### Recommended Hosting
To keep the real-time functionality intact, use a platform that supports persistent containers or Node.js processes:

1. **Railway.app**: Extremely easy to set up. It will automatically detect the `package.json` and start the server.
2. **Render.com**: Choose "Web Service" and link your GitHub repo.
3. **DigitalOcean App Platform**: A robust alternative for scaling.
4. **Cloud Run (Google Cloud)**: What this environment uses! Ideal for high scalability.

**Configuration Tips**:
- Ensure your host is set to `0.0.0.0` (which is already configured in `server.ts`).
- Set the `PORT` environment variable if your host requires a specific one (the app defaults to 3000 but usually hosting providers inject their own).

## 🎨 Design Theme
The app uses a **Bento Grid** aesthetic:
- **Dark Mode**: Deep charcoal and navy backgrounds.
- **Vibrant Accents**: High-contrast tier colors (Red, Orange, Yellow, Green, Blue).
- **Rounded UI**: Large corner radii (24px) for a modern, tactile feel.
- **Typography**: Bold, high-weight headings with clean sans-serif body text.

## 📜 Game Rules
1. **Lobby**: Create a room and share the 4-digit code.
2. **Selecting**: The Chooser picks a category (e.g., Food > Snacks) and 5 items.
3. **Ranking**: All players drag and drop items into S-D tiers. The Chooser sets the "Truth," others guess.
4. **Scoring**: Points are awarded based on "Distance" from the Chooser's rank.
   - `Score = Math.max(0, 100 - (totalDistance * 10))`
5. **Results**: Reveal the truth, see the round scores, and move to the next round with a new Chooser.
