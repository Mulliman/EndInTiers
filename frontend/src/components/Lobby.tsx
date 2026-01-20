'use client';
import React from 'react';
import { GameState } from '../types/game';

interface LobbyProps {
    gameState: GameState;
    playerId: string;
}

export default function Lobby({ gameState, playerId }: LobbyProps) {
    const isHost = gameState.players.find(p => p.id === playerId)?.isHost;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-4">Lobby</h1>
            
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <p className="text-gray-400 mb-2">Room Code</p>
                <div className="text-6xl font-mono font-bold text-yellow-500 tracking-widest mb-8">
                    {gameState.roomCode}
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">Players ({gameState.players.length}/8)</h2>
                    <ul className="space-y-2">
                        {gameState.players.map((player) => (
                            <li key={player.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                <span className={player.id === playerId ? "font-bold text-blue-400" : ""}>
                                    {player.name} {player.id === playerId && "(You)"}
                                </span>
                                {player.isHost && (
                                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">HOST</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Placeholder for future Host "Start Game" button */}
                {isHost && (
                    <div className="mt-8 p-4 bg-gray-700/50 rounded border border-dashed border-gray-600">
                        <p className="text-sm text-gray-400">Waiting for players...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
