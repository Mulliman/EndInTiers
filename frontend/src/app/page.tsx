'use client';
import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import Lobby from '@/components/Lobby';
import SelectionPhase from '@/components/SelectionPhase';
import RankingPhase from '@/components/RankingPhase';
import ResultsPhase from '@/components/ResultsPhase';
import { GameState } from '@/types/game';

let socket: Socket;

export default function Home() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [joined, setJoined] = useState(false);
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Initialize socket connection
        // Note: NEXT_PUBLIC_BACKEND_URL should be set in environment, defaulting to localhost:3001
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        socket = io(backendUrl);

        socket.on('GAME_UPDATED', (newGameState: GameState) => {
            setGameState(newGameState);
            setJoined(true);
            setError('');
        });

        socket.on('ERROR', (msg: string) => {
            setError(msg);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const createGame = () => {
        if (!name) return setError('Please enter your name');
        socket.emit('CREATE_GAME', name);
    };

    const joinGame = () => {
        if (!name) return setError('Please enter your name');
        if (!roomCode) return setError('Please enter a room code');
        socket.emit('JOIN_GAME', roomCode.toUpperCase(), name);
    };

    const startGame = () => {
        socket.emit('START_GAME');
    };

    if (gameState && joined) {
        const myPlayer = gameState.players.find(p => p.id === socket.id);

        if (gameState.status === 'LOBBY') {
             return (
                 <div className="relative">
                     <Lobby gameState={gameState} playerId={socket.id || ''} />
                     {myPlayer?.isHost && (
                         <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                             <button 
                                 onClick={startGame}
                                 className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-full shadow-lg text-xl transition transform hover:scale-105 active:scale-95"
                             >
                                 Start Game
                             </button>
                         </div>
                     )}
                 </div>
             );
        }

        if (gameState.status === 'SELECTING') {
            const chooser = gameState.players.find(p => p.isChooser);
            return (
                <SelectionPhase 
                    socket={socket} 
                    isChooser={!!myPlayer?.isChooser} 
                    chooserName={chooser?.name} 
                />
            );
        }


        if (gameState.status === 'RANKING') {
            const hasSubmitted = !!gameState.currentRound.submissions[socket.id];
            const submissionsCount = Object.keys(gameState.currentRound.submissions).length;
            
            return (
                <RankingPhase 
                    socket={socket}
                    words={gameState.currentRound.words}
                    hasSubmitted={hasSubmitted}
                    submissionsCount={submissionsCount}
                    totalPlayers={gameState.players.length}
                />
            );
        }

        if (gameState.status === 'RESULTS') {
            return (
                <ResultsPhase 
                    socket={socket}
                    gameState={gameState}
                    playerId={socket.id || ''}
                />
            );
        }
        
        // Placeholder for future states
        return <div className="text-white text-center mt-20">Game Status: {gameState.status}</div>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
            <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
                EndInTiers HOT RELOAD
            </h1>

            <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="border-t border-gray-800 my-6"></div>

                    <div className="space-y-3">
                        <button
                            onClick={createGame}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95"
                        >
                            Host New Game
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-800"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-800"></div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none uppercase font-mono tracking-wider"
                                placeholder="CODE"
                                maxLength={4}
                            />
                            <button
                                onClick={joinGame}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-lg transition transform active:scale-95"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
