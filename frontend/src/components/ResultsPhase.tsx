'use client';
import React from 'react';
import { Socket } from 'socket.io-client';
import { GameState, Player } from '../types/game';

interface ResultsPhaseProps {
    socket: Socket;
    gameState: GameState;
    playerId: string;
}

const TIER_LABELS: Record<number, string> = {
    4: 'S', 3: 'A', 2: 'B', 1: 'C', 0: 'D'
};

const TIER_COLORS: Record<number, string> = {
    4: 'text-red-500', 3: 'text-orange-500', 2: 'text-yellow-500', 1: 'text-green-500', 0: 'text-blue-500'
};

export default function ResultsPhase({ socket, gameState, playerId }: ResultsPhaseProps) {
    const { players, currentRound, nextChooserId, lastRoundScores } = gameState;
    const chooser = players.find(p => p.isChooser);
    const myPlayer = players.find(p => p.id === playerId);
    
    // Sort players by total score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    const isNextChooser = nextChooserId === playerId;

    const handleStartNextRound = () => {
        socket.emit('START_NEXT_ROUND');
    };


    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 pb-20">
            <h1 className="text-4xl font-bold mb-2 text-yellow-400">Round Results</h1>
            <div className="text-center mb-8">
                <p className="text-gray-400">Category: {currentRound.category}</p>
                {currentRound.question && (
                    <p className="text-xl text-white italic mt-1 font-medium">"{currentRound.question}"</p>
                )}
            </div>

            {/* Consolidated Results Table */}
            <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center border-b border-gray-700 pb-2">
                    {chooser?.name}'s Master List vs Your Prediction
                    <span className="block text-green-400 text-lg mt-1 font-normal">(+{lastRoundScores?.[playerId] || 0} pts)</span>
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 text-center">Them</th>
                                <th className="p-4 text-center">Word</th>
                                <th className="p-4 text-center">You</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-2">
                            {currentRound.words
                                .sort((a, b) => {
                                    const rankA = currentRound.submissions[chooser?.id || '']?.[a] ?? -1;
                                    const rankB = currentRound.submissions[chooser?.id || '']?.[b] ?? -1;
                                    return rankB - rankA; // Descending order (S -> D)
                                })
                                .map((word) => {
                                    const chooserRank = currentRound.submissions[chooser?.id || '']?.[word];
                                    const myRank = currentRound.submissions[playerId]?.[word];
                                    const isMatch = chooserRank === myRank;

                                    return (
                                        <tr 
                                            key={word} 
                                            className={`
                                                border-b border-gray-700 last:border-0 hover:bg-gray-750 transition
                                                ${isMatch ? 'bg-green-900/30' : ''}
                                            `}
                                        >
                                            {/* Chooser's Tier (Master) */}
                                            <td className="p-4 text-center">
                                                <div className={`
                                                    mx-auto w-10 h-10 flex items-center justify-center rounded font-bold text-xl shadow-sm
                                                    ${isMatch ? 'ring-2 ring-green-500' : ''}
                                                `}>
                                                    <span className={TIER_COLORS[chooserRank!]}>
                                                        {TIER_LABELS[chooserRank!]}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Word */}
                                            <td className="p-4 text-lg font-medium text-center">{word}</td>

                                            {/* Player's Predicted Tier */}
                                            <td className="p-4 text-center">
                                                 <div className="flex flex-col items-center justify-center">
                                                    <span className={`text-2xl font-bold ${TIER_COLORS[myRank!] || 'text-gray-500'}`}>
                                                        {TIER_LABELS[myRank!] ?? '-'}
                                                    </span>
                                                    {myRank !== undefined && !isMatch && (
                                                        <span className="text-xs text-red-400 mt-1">
                                                            (diff: {Math.abs(myRank - chooserRank!)})
                                                        </span>
                                                    )}
                                                 </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="mt-8 w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">Leaderboard</h2>
                <ul className="space-y-3">
                    {sortedPlayers.map((p, idx) => (
                        <li key={p.id} className="flex items-center justify-between bg-gray-900 p-3 rounded">
                            <div className="flex items-center gap-4">
                                <span className={`
                                    font-bold w-6 text-center
                                    ${idx === 0 ? 'text-yellow-500 text-xl' : 'text-gray-500'}
                                `}>
                                    {idx + 1}
                                </span>
                                <span className="text-lg">
                                    {p.name} {p.id === playerId && '(You)'}
                                    {p.id === nextChooserId && <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded text-white">NEXT CHOOSER</span>}
                                </span>
                            </div>
                            <span className="font-mono text-xl font-bold text-green-400">
                                {p.score} pts
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Next Round Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 flex justify-center">
                {isNextChooser ? (
                    <button 
                        onClick={handleStartNextRound}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg animate-bounce"
                    >
                        Start Next Round
                    </button>
                ) : (
                    <p className="text-gray-500 italic">
                        Waiting for {players.find(p => p.id === nextChooserId)?.name} to start...
                    </p>
                )}
            </div>
        </div>
    );
}
