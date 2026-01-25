'use client';
import React from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../../types/game';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import Container from '../atoms/Container';
import PhaseHeader from '../modules/PhaseHeader';
import Leaderboard from '../modules/Leaderboard';

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
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const isNextChooser = nextChooserId === playerId;

    const handleStartNextRound = () => {
        socket.emit('START_NEXT_ROUND');
    };

    return (
        <Container className="justify-start py-12 px-4 pb-40">
            <PhaseHeader 
                phase="Results"
                title="Round Review"
                subtitle={
                    <span>
                        Category: <span className="text-white font-bold">{currentRound.category}</span>
                        {currentRound.question && <span className="block mt-2 text-2xl font-black italic">"{currentRound.question}"</span>}
                    </span>
                }
            />

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
                    <Leaderboard 
                        standings={sortedPlayers.map(p => ({
                            id: p.id,
                            name: p.name,
                            score: p.score,
                            isCurrentPlayer: p.id === playerId,
                            isNextChooser: p.id === nextChooserId
                        }))}
                    />
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
