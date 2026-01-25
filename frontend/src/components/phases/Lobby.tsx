'use client';
import React from 'react';
import { GameState } from '../../types/game';
import Card from '../atoms/Card';
import Container from '../atoms/Container';
import PlayerList from '../modules/PlayerList';

interface LobbyProps {
    gameState: GameState;
    playerId: string;
}

export default function Lobby({ gameState, playerId }: LobbyProps) {
    const isHost = gameState.players.find(p => p.id === playerId)?.isHost;

    return (
        <Container>
            <h1 className="text-5xl font-black mb-12 text-blue-400">Lobby</h1>
            
            <Card className="w-full max-w-md text-center">
                <p className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-2">Room Code</p>
                <div className="text-7xl font-mono font-black text-yellow-500 tracking-[0.2em] mb-12 drop-shadow-lg leading-none">
                    {gameState.roomCode}
                </div>

                <PlayerList 
                    players={gameState.players} 
                    currentPlayerId={playerId} 
                />

                {isHost && gameState.players.length < 2 && (
                    <div className="mt-10 p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                        <p className="text-sm text-gray-400 italic">Waiting for at least one more player...</p>
                    </div>
                )}
            </Card>
        </Container>
    );
}
