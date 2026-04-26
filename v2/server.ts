import express from "express";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import process from "process";

type GameState = 'LOBBY' | 'SELECTING' | 'RANKING' | 'RESULTS';

interface Player {
  id: string; // generated client ID
  socketId: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
}

interface TopicInfo {
  id: string;
  name: string;
  questions: string[];
  options: string[];
  tags: string[];
}

interface Subcategory {
  name: string;
  topics: TopicInfo[];
}

interface Category {
  category: string;
  subcategories: Subcategory[];
}

interface Room {
  code: string;
  state: GameState;
  players: Player[]; // max 8
  chooserIndex: number;
  roundTopic: TopicInfo | null;
  roundPrompt: string | null;
  selectedItems: string[]; // exactly 5
  playerRankings: Record<string, string[]>; // Map player ID to their ranked items
  categories: Category[];
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// loadedCategories logic is moved up

let loadedCategories: Category[] = [];

function loadData() {
  const categories: Category[] = [];
  const baseDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(baseDir)) {
    console.warn("Data directory not found:", baseDir);
    return [];
  }

  const catNames = fs.readdirSync(baseDir);
  for (const catName of catNames) {
    const catPath = path.join(baseDir, catName);
    if (!fs.statSync(catPath).isDirectory()) continue;

    const subcategories: Subcategory[] = [];
    const subcatNames = fs.readdirSync(catPath);

    for (const subName of subcatNames) {
      const subPath = path.join(catPath, subName);
      if (!fs.statSync(subPath).isDirectory()) continue;

      const topics: TopicInfo[] = [];
      const topicFiles = fs.readdirSync(subPath).filter(f => f.endsWith(".json"));

      for (const topicFile of topicFiles) {
        const topicPath = path.join(subPath, topicFile);
        try {
          const content = JSON.parse(fs.readFileSync(topicPath, "utf-8"));
          if (Array.isArray(content)) {
            topics.push(...content);
          } else {
            topics.push(content);
          }
        } catch (e) {
          console.error(`Error loading topic ${topicPath}:`, e);
        }
      }

      if (topics.length > 0) {
        subcategories.push({ name: subName, topics });
      }
    }

    if (subcategories.length > 0) {
      categories.push({ category: catName, subcategories });
    }
  }
  return categories;
}

// Initial load
loadedCategories = loadData();

function sanitizeRoom(room: Room, playerId: string) {
  // Hide other player rankings during RANKING state
  const isResults = room.state === 'RESULTS';
  const playerRankingsSafelist: Record<string, string[]> = {};
  
  if (isResults) {
    Object.assign(playerRankingsSafelist, room.playerRankings);
  } else {
    // Only return the current player's ranking and maybe the length of others to show "submitted"
    if (room.playerRankings[playerId]) {
      playerRankingsSafelist[playerId] = room.playerRankings[playerId];
    }
  }

  // Count submissions
  const submissionTracker: Record<string, boolean> = {};
  room.players.forEach(p => {
    submissionTracker[p.id] = !!room.playerRankings[p.id];
  });

  return {
    ...room,
    playerRankings: playerRankingsSafelist,
    submissions: submissionTracker,
    chooser: room.players[room.chooserIndex] || null,
  };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  const PORT = Number(process.env.PORT) || 3000;

  const rooms = new Map<string, Room>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("CREATE_GAME", ({ name, playerId }, callback) => {
      let code = generateRoomCode();
      while (rooms.has(code)) {
        code = generateRoomCode();
      }
      
      const newRoom: Room = {
        code,
        state: 'LOBBY',
        players: [{ id: playerId, socketId: socket.id, name, score: 0, isHost: true, connected: true }],
        chooserIndex: 0,
        roundTopic: null,
        roundPrompt: null,
        selectedItems: [],
        playerRankings: {},
        categories: loadedCategories,
      };
      
      rooms.set(code, newRoom);
      socket.join(code);
      callback({ success: true, room: sanitizeRoom(newRoom, playerId) });
    });

    socket.on("JOIN_GAME", ({ roomCode, name, playerId }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        callback({ success: false, error: "Room not found" });
        return;
      }
      if (room.players.length >= 8 && !room.players.find(p => p.id === playerId)) {
        callback({ success: false, error: "Room is full" });
        return;
      }
      
      const existingPlayer = room.players.find(p => p.id === playerId);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.connected = true;
        existingPlayer.name = name; // Update name if they want
      } else {
        if (room.state !== 'LOBBY') {
           callback({ success: false, error: "Game already started" });
           return;
        }
        room.players.push({ id: playerId, socketId: socket.id, name, score: 0, isHost: false, connected: true });
      }
      
      socket.join(roomCode);
      
      // Update all players in room
      room.players.forEach(p => {
        io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
      });
      callback({ success: true, room: sanitizeRoom(room, playerId) });
    });

    socket.on("START_GAME", ({ roomCode, playerId }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (player?.isHost) {
        room.state = 'SELECTING';
        room.chooserIndex = Math.floor(Math.random() * room.players.length);
        room.players.forEach(p => {
          io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
        });
      }
    });

    socket.on("RELOAD_DATA", ({ roomCode, playerId }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (player?.isHost) {
        loadedCategories = loadData();
        room.players.forEach(p => {
          io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
        });
        if (callback) callback({ success: true });
      }
    });

    socket.on("SET_WORDS", ({ roomCode, playerId, topic, prompt, items }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      
      const chooser = room.players[room.chooserIndex];
      if (chooser.id === playerId && items.length === 5) {
        room.roundTopic = topic;
        room.roundPrompt = prompt;
        room.selectedItems = items;
        room.playerRankings = {}; // reset previous rankings
        room.state = 'RANKING';
        
        room.players.forEach(p => {
          io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
        });
      }
    });

    socket.on("SUBMIT_RANKING", ({ roomCode, playerId, ranking }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      
      room.playerRankings[playerId] = ranking;
      
      const allSubmitted = room.players.every(p => p.id in room.playerRankings);
      if (allSubmitted) {
        // Calculate scores
        const chooser = room.players[room.chooserIndex];
        const chooserRanking = room.playerRankings[chooser.id];
        
        room.players.forEach(p => {
          if (p.id !== chooser.id) {
            const playerRanking = room.playerRankings[p.id];
            let totalDistance = 0;
            
            // For each item, find its index in chooser's ranking and player's ranking
            chooserRanking.forEach((item, cIndex) => {
              const pIndex = playerRanking.indexOf(item);
              totalDistance += Math.abs(cIndex - pIndex);
            });
            
            p.score += Math.max(0, 100 - (totalDistance * 10));
          }
        });
        
        room.state = 'RESULTS';
      }
      
      room.players.forEach(p => {
        io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
      });
    });

    socket.on("START_NEXT_ROUND", ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      
      room.state = 'SELECTING';
      room.chooserIndex = (room.chooserIndex + 1) % room.players.length;
      room.roundTopic = null;
      room.roundPrompt = null;
      room.selectedItems = [];
      room.playerRankings = {};
      
      room.players.forEach(p => {
        io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
      });
    });

    socket.on("LEAVE_GAME", ({ roomCode, playerId }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex > -1) {
        const wasChooser = playerIndex === room.chooserIndex;
        // Clean up rankings
        delete room.playerRankings[playerId];
        
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        } else {
          // Reassign host if needed
          if (!room.players.some(p => p.isHost)) {
            room.players[0].isHost = true;
          }
          
          if (room.state !== 'LOBBY') {
            if (room.players.length < 2) {
              room.state = 'LOBBY';
              room.chooserIndex = 0;
            } else if (wasChooser) {
              room.state = 'LOBBY';
              room.chooserIndex = 0;
            } else if (playerIndex < room.chooserIndex) {
              room.chooserIndex--;
            }
          }
          
          // Check if we need to transition from RANKING to RESULTS because the non-submitting player left
          if (room.state === 'RANKING') {
            const allSubmitted = room.players.every(p => p.id in room.playerRankings);
            if (allSubmitted) {
              const chooser = room.players[room.chooserIndex];
              const chooserRanking = room.playerRankings[chooser.id];
              
              room.players.forEach(p => {
                if (p.id !== chooser.id) {
                  const playerRanking = room.playerRankings[p.id];
                  let totalDistance = 0;
                  chooserRanking.forEach((item, cIndex) => {
                    const pIndex = playerRanking.indexOf(item);
                    totalDistance += Math.abs(cIndex - pIndex);
                  });
                  p.score += Math.max(0, 100 - (totalDistance * 10));
                }
              });
              room.state = 'RESULTS';
            }
          }
          
          room.players.forEach(p => {
            io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      rooms.forEach((room, code) => {
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          player.connected = false;
          // Notify room
          room.players.forEach(p => {
            io.to(p.socketId).emit("room_update", sanitizeRoom(room, p.id));
          });
        }
      });
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
