import React from 'react';
import Card from '../atoms/Card';

interface Player {
    id: string;
    name: string;
    isHost?: boolean;
}

interface PlayerListProps {
    players: Player[];
    currentPlayerId: string;
    showHostBadge?: boolean;
    maxPlayers?: number;
}

export default function PlayerList({ 
    players, 
    currentPlayerId, 
    showHostBadge = true,
    maxPlayers = 8 
}: PlayerListProps) {
    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h2 className="text-xl font-bold">Players</h2>
                <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-mono text-gray-400">
                    {players.length}/{maxPlayers}
                </span>
            </div>
            
            <ul className="space-y-3">
                {players.map((player) => (
                    <li 
                        key={player.id} 
                        className={`
                            flex items-center justify-between p-4 rounded-xl transition-all border
                            ${player.id === currentPlayerId 
                                ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                                : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`
                                h-2 w-2 rounded-full animate-pulse
                                ${player.id === currentPlayerId ? 'bg-blue-400' : 'bg-green-400'}
                            `} />
                            <span className={`text-lg ${player.id === currentPlayerId ? "font-black text-blue-400" : "font-medium"}`}>
                                {player.name} {player.id === currentPlayerId && "(You)"}
                            </span>
                        </div>
                        {showHostBadge && player.isHost && (
                            <span className="text-[10px] font-black bg-yellow-500 text-black px-2 py-1 rounded-md tracking-tighter uppercase">Host</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
