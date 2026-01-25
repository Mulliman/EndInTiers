'use client';
import React from 'react';
import { GameState } from '../types/game';
import Card from './ui/Card';
import Container from './ui/Container';

interface LobbyProps {
    gameState: GameState;
    playerId: string;
}

export default function Lobby({ gameState, playerId }: LobbyProps) {
    const isHost = gameState.players.find(p => p.id === playerId)?.isHost;

    return (
        <Container>
            <h1 className="text-5xl font-black mb-8 text-blue-400">Lobby</h1>
            
            <Card className="w-full max-w-md text-center">
                <p className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-2">Room Code</p>
                <div className="text-7xl font-mono font-black text-yellow-500 tracking-[0.2em] mb-10 drop-shadow-lg">
                    {gameState.roomCode}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h2 className="text-xl font-bold">Players</h2>
                        <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-mono text-gray-400">
                            {gameState.players.length}/8
                        </span>
                    </div>
                    
                    <ul className="space-y-3">
                        {gameState.players.map((player) => (
                            <li 
                                key={player.id} 
                                className={`
                                    flex items-center justify-between p-4 rounded-xl transition-all
                                    ${player.id === playerId ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-gray-800/50 border border-gray-700/50'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`
                                        h-2 w-2 rounded-full animate-pulse
                                        ${player.id === playerId ? 'bg-blue-400' : 'bg-green-400'}
                                    `} />
                                    <span className={`text-lg ${player.id === playerId ? "font-black text-blue-400" : "font-medium"}`}>
                                        {player.name} {player.id === playerId && "(You)"}
                                    </span>
                                </div>
                                {player.isHost && (
                                    <span className="text-[10px] font-black bg-yellow-500 text-black px-2 py-1 rounded-md tracking-tighter">HOST</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {isHost && gameState.players.length < 2 && (
                    <div className="mt-10 p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                        <p className="text-sm text-gray-400 italic">Waiting for at least one more player...</p>
                    </div>
                )}
            </Card>
        </Container>
    );
}
