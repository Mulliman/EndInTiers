import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameState, ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './types';
import { CATEGORIES } from './data';

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
                chooserRankings: {},
                submissions: {}
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

    socket.on('START_GAME', () => {
        const roomCode = socket.data.roomCode;
        const game = games[roomCode];
        if (!game) return;

        // Verify host
        const player = game.players.find(p => p.id === socket.id);
        if (!player || !player.isHost) {
             socket.emit('ERROR', 'Only host can start game');
             return;
        }

        if (game.status !== 'LOBBY') return;

        // Assign Chooser
        const randomIdx = Math.floor(Math.random() * game.players.length);
        game.players.forEach((p, idx) => {
            p.isChooser = (idx === randomIdx);
        });

        game.status = 'SELECTING';
        io.to(roomCode).emit('GAME_UPDATED', game);
        console.log(`Game ${roomCode} started. Chooser: ${game.players[randomIdx].name}`);
    });

    socket.on('GET_CATEGORIES', () => {
        // Send categories to the requesting socket (the chooser)
        socket.emit('CATEGORIES_SENT', CATEGORIES);
    });

    socket.on('SET_WORDS', (categoryName, selectedWords, question) => {
        const roomCode = socket.data.roomCode;
        const game = games[roomCode];
        if (!game) return;

        const player = game.players.find(p => p.id === socket.id);
        if (!player || !player.isChooser) {
            socket.emit('ERROR', 'Only chooser can set words');
            return;
        }

        if (game.status !== 'SELECTING') return;

        if (selectedWords.length !== 5) {
            socket.emit('ERROR', 'Must select exactly 5 words');
            return;
        }

        game.currentRound.category = categoryName;
        game.currentRound.words = selectedWords;
        game.currentRound.question = question;
        game.status = 'RANKING';

        io.to(roomCode).emit('GAME_UPDATED', game);
    });

    socket.on('SUBMIT_RANKING', (rankings) => {
        const roomCode = socket.data.roomCode;
        const game = games[roomCode];
        if (!game) return;

        if (game.status !== 'RANKING') return;

        // Store submission
        game.currentRound.submissions[socket.id] = rankings;

        // Check if all players have submitted
        const totalPlayers = game.players.length;
        const totalSubmissions = Object.keys(game.currentRound.submissions).length;

        if (totalSubmissions >= totalPlayers) {
            game.status = 'RESULTS';
            
            // Calculate Scores
            const chooser = game.players.find(p => p.isChooser);
            const chooserSubmissions = chooser ? game.currentRound.submissions[chooser.id] : {};
            
            const roundScores: Record<string, number> = {};

            if (chooser && chooserSubmissions) {
                game.players.forEach(player => {
                    const playerSubmissions = game.currentRound.submissions[player.id];
                    if (!playerSubmissions) return;

                    let totalDistance = 0;
                    Object.entries(game.currentRound.words).forEach(([_, word]) => { // Iterate words array properly
                         // Actually words is string[], so we iterate that
                    });
                     // Fix: words is string[]
                     game.currentRound.words.forEach(word => {
                         const chooserRank = chooserSubmissions[word];
                         const playerRank = playerSubmissions[word];
                         // Safety check if ranks exist (they should)
                         if (chooserRank !== undefined && playerRank !== undefined) {
                             totalDistance += Math.abs(playerRank - chooserRank);
                         }
                     });

                     const score = Math.max(0, 100 - (totalDistance * 10));
                     player.score += score;
                     roundScores[player.id] = score;
                });
            }
            
            game.lastRoundScores = roundScores;

            // Determine next chooser
            const currentChooserIndex = game.players.findIndex(p => p.isChooser);
            const nextChooserIndex = (currentChooserIndex + 1) % game.players.length;
            game.nextChooserId = game.players[nextChooserIndex].id;
        }

        io.to(roomCode).emit('GAME_UPDATED', game);
    });

    socket.on('START_NEXT_ROUND', () => {
        const roomCode = socket.data.roomCode;
        const game = games[roomCode];
        if (!game) return;

        // Verify next chooser is starting it (optional, but good practice)
        // Or allowing any player to start next round is easier for now, but UI will restrict button.
        // Let's rely on finding who SHOULD be next.
        
        const currentChooserIndex = game.players.findIndex(p => p.isChooser);
        // Reset current chooser
        if (currentChooserIndex !== -1) {
            game.players[currentChooserIndex].isChooser = false;
        }

        // Set next chooser
        const nextChooserIndex = (currentChooserIndex + 1) % game.players.length;
        game.players[nextChooserIndex].isChooser = true;

        // Reset Round Data
        game.currentRound = {
            category: '',
            words: [],
            chooserRankings: {},
            submissions: {}
        };
        game.lastRoundScores = undefined;
        game.nextChooserId = undefined;
        game.status = 'SELECTING';

        io.to(roomCode).emit('GAME_UPDATED', game);
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
