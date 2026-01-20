import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameState, ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
        origin: "*", // Allow all for now, can be restricted later
        methods: ["GET", "POST"]
    }
});

const games: Record<string, GameState> = {};

// Helper to generate a random 4-character room code
const generateRoomCode = (): string => {
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   let result = '';
   for (let i = 0; i < 4; i++) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('CREATE_GAME', (playerName) => {
        let roomCode = generateRoomCode();
        // Ensure uniqueness (simple check, theoretically could loop forever if full but highly unlikely for this scale)
        while (games[roomCode]) {
            roomCode = generateRoomCode();
        }

        const newGame: GameState = {
            roomCode,
            players: [{
                id: socket.id,
                name: playerName,
                score: 0,
                isHost: true,
                isChooser: false // Will be set later
            }],
            status: 'LOBBY',
            currentRound: {
                category: '',
                words: [],
                chooserRankings: {}
            }
        };

        games[roomCode] = newGame;
        socket.join(roomCode);
        
        // Store metadata on socket for easier disconnect handling
        socket.data.roomCode = roomCode;
        socket.data.name = playerName;

        io.to(roomCode).emit('GAME_UPDATED', newGame);
        console.log(`Game created: ${roomCode} by ${playerName}`);
    });

    socket.on('JOIN_GAME', (roomCode, playerName) => {
        const game = games[roomCode];
        if (!game) {
            socket.emit('ERROR', 'Room not found');
            return;
        }

        if (game.status !== 'LOBBY') {
            socket.emit('ERROR', 'Game already in progress');
            return;
        }

        if (game.players.length >= 8) {
            socket.emit('ERROR', 'Room is full');
            return;
        }

        const newPlayer = {
            id: socket.id,
            name: playerName,
            score: 0,
            isHost: false, // Default to not host
            isChooser: false
        };

        game.players.push(newPlayer);
        socket.join(roomCode);

        // Store metadata
        socket.data.roomCode = roomCode;
        socket.data.name = playerName;

        io.to(roomCode).emit('GAME_UPDATED', game);
        console.log(`Player ${playerName} joined ${roomCode}`);
    });

    socket.on('disconnect', () => {
        const roomCode = socket.data.roomCode;
        if (roomCode && games[roomCode]) {
            const game = games[roomCode];
            // Remove player
            game.players = game.players.filter(p => p.id !== socket.id);

            // If empty, delete game
            if (game.players.length === 0) {
                delete games[roomCode];
                console.log(`Game ${roomCode} deleted (empty)`);
            } else {
                // If host left, assign new host (optional, but good for UX)
                // For now, just remove player and sync
                io.to(roomCode).emit('GAME_UPDATED', game);
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
