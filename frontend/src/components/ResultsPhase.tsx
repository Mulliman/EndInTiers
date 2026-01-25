'use client';
import React from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../types/game';
import Button from './ui/Button';
import Card from './ui/Card';
import Container from './ui/Container';

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

const TIER_BG: Record<number, string> = {
    4: 'bg-red-500/10 border-red-500/30', 
    3: 'bg-orange-500/10 border-orange-500/30', 
    2: 'bg-yellow-500/10 border-yellow-500/30', 
    1: 'bg-green-500/10 border-green-500/30', 
    0: 'bg-blue-500/10 border-blue-500/30'
};

export default function ResultsPhase({ socket, gameState, playerId }: ResultsPhaseProps) {
    const { players, currentRound, nextChooserId, lastRoundScores } = gameState;
    const chooser = players.find(p => p.isChooser);
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const isNextChooser = nextChooserId === playerId;

    const handleStartNextRound = () => {
        socket.emit('START_NEXT_ROUND');
    };

    return (
        <Container className="justify-start py-12 px-4 pb-40">
            <h1 className="text-5xl font-black mb-2 text-yellow-500 drop-shadow-lg">Results</h1>
            
            <div className="text-center mb-12">
                <p className="text-gray-500 font-black tracking-widest uppercase text-xs mb-1">Round Context</p>
                <p className="text-gray-400 mb-2">Category: <span className="text-white font-bold">{currentRound.category}</span></p>
                {currentRound.question && (
                    <h2 className="text-2xl text-white italic font-black">"{currentRound.question}"</h2>
                )}
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Results Table */}
                <div className="lg:col-span-3 space-y-6">
                    <Card variant="glass" className="overflow-hidden p-0 relative border-white/5">
                        <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-black text-xl text-blue-400">Match Analysis</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Your Score:</span>
                                <span className="text-2xl font-black text-green-400">+{lastRoundScores?.[playerId] || 0}</span>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <div className="grid grid-cols-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">
                                <div className="text-center">Them</div>
                                <div className="col-span-3 text-center">Item</div>
                                <div className="text-center">You</div>
                            </div>

                            <div className="space-y-2">
                                {currentRound.words
                                    .sort((a, b) => {
                                        const rankA = currentRound.submissions[chooser?.id || '']?.[a] ?? -1;
                                        const rankB = currentRound.submissions[chooser?.id || '']?.[b] ?? -1;
                                        return rankB - rankA;
                                    })
                                    .map((word) => {
                                        const chooserRank = currentRound.submissions[chooser?.id || '']?.[word];
                                        const myRank = currentRound.submissions[playerId]?.[word];
                                        const isMatch = chooserRank === myRank;

                                        return (
                                            <div 
                                                key={word} 
                                                className={`
                                                    grid grid-cols-5 items-center p-3 rounded-xl border transition-all
                                                    ${isMatch ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-gray-900/50 border-gray-800'}
                                                `}
                                            >
                                                <div className="flex justify-center">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded font-black text-xl ${TIER_COLORS[chooserRank!]}`}>
                                                        {TIER_LABELS[chooserRank!]}
                                                    </div>
                                                </div>
                                                <div className="col-span-3 text-center font-bold text-lg">{word}</div>
                                                <div className="flex justify-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-xl font-black ${TIER_COLORS[myRank!] || 'text-gray-700'}`}>
                                                            {TIER_LABELS[myRank!] ?? '-'}
                                                        </span>
                                                        {myRank !== undefined && !isMatch && (
                                                            <span className="text-[10px] font-black text-red-500/70">
                                                                Δ{Math.abs(myRank - chooserRank!)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Leaderboard */}
                <div className="lg:col-span-2 space-y-6">
                    <Card variant="default" className="border-gray-800">
                        <h3 className="text-xl font-black mb-6 text-center text-purple-400 uppercase tracking-widest">Standings</h3>
                        <ul className="space-y-3">
                            {sortedPlayers.map((p, idx) => (
                                <li key={p.id} className="group">
                                    <div className={`
                                        flex items-center justify-between p-3 rounded-xl transition-all
                                        ${p.id === playerId ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-gray-900 border border-gray-800'}
                                    `}>
                                        <div className="flex items-center gap-3">
                                            <span className={`
                                                font-black w-6 text-center
                                                ${idx === 0 ? 'text-yellow-500 text-xl' : 'text-gray-600'}
                                            `}>
                                                {idx + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${p.id === playerId ? 'text-white' : 'text-gray-300'}`}>
                                                    {p.name} {p.id === playerId && '(You)'}
                                                </span>
                                                {p.id === nextChooserId && (
                                                    <span className="text-[8px] font-black text-purple-400 uppercase tracking-tighter">Next Up</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-mono text-xl font-black text-green-500">
                                            {p.score}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Next Round Action */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gray-950/80 backdrop-blur-xl border-t border-gray-900 flex justify-center z-50">
                {isNextChooser ? (
                    <Button 
                        onClick={handleStartNextRound}
                        variant="secondary"
                        size="xl"
                        className="animate-pulse shadow-[0_0_30px_rgba(147,51,234,0.3)]"
                    >
                        Begin Next Round
                    </Button>
                ) : (
                    <Card variant="glass" className="py-3 px-8 border-white/5">
                        <p className="text-gray-500 italic font-medium">
                            Waiting for <span className="text-white font-bold">{players.find(p => p.id === nextChooserId)?.name}</span> to kick off the next round...
                        </p>
                    </Card>
                )}
            </div>
        </Container>
    );
}
