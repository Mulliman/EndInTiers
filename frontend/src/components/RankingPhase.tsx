'use client';
import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface RankingPhaseProps {
    socket: Socket;
    words: string[];
    hasSubmitted: boolean;
    submissionsCount: number;
    totalPlayers: number;
}

const TIERS = [
    { id: 'S', value: 4, color: 'bg-red-500' },
    { id: 'A', value: 3, color: 'bg-orange-500' },
    { id: 'B', value: 2, color: 'bg-yellow-500' },
    { id: 'C', value: 1, color: 'bg-green-500' },
    { id: 'D', value: 0, color: 'bg-blue-500' },
];

function DraggableWord({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} 
             className="bg-white text-gray-900 p-2 rounded shadow font-bold text-center cursor-move touch-none">
            {id}
        </div>
    );
}

function DroppableTier({ id, children, color }: { id: string, children: React.ReactNode, color: string }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`flex items-center gap-4 mb-2 p-2 rounded ${color} bg-opacity-20 border border-gray-600 min-h-[80px]`}>
            <div className={`w-12 h-12 flex items-center justify-center rounded font-bold text-xl ${color} text-white`}>
                {id}
            </div>
            <div className="flex-1 flex flex-wrap gap-2">
                {children}
            </div>
        </div>
    );
}

export default function RankingPhase({ socket, words, hasSubmitted, submissionsCount, totalPlayers }: RankingPhaseProps) {
    const [rankings, setRankings] = useState<Record<string, string>>({}); // word -> tierId
    const [activeId, setActiveId] = useState<string | null>(null);

    // Initial pool of unranked words (those not in rankings)
    const unrankedWords = words.filter(w => !rankings[w]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id) {
            const word = active.id as string;
            const tierId = over.id as string;
            
            // If dropped on "pool", remove from rankings
            if (tierId === 'pool') {
                const newRankings = { ...rankings };
                delete newRankings[word];
                setRankings(newRankings);
            } else if (TIERS.some(t => t.id === tierId)) {
                setRankings(prev => ({ ...prev, [word]: tierId }));
            }
        }
    };

    const submitRanking = () => {
        // Convert tier IDs 'S','A' etc to values 4,3,2,1,0
        const submission: Record<string, number> = {};
        Object.entries(rankings).forEach(([word, tierId]) => {
            const tier = TIERS.find(t => t.id === tierId);
            if (tier) submission[word] = tier.value;
        });
        socket.emit('SUBMIT_RANKING', submission);
    };

    const isComplete = words.every(w => rankings[w]);

    if (hasSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center animate-pulse">
                    <h2 className="text-3xl font-bold mb-4">Ranking Submitted!</h2>
                    <p className="text-xl text-gray-400 mb-6">Waiting for other players...</p>
                    <div className="text-4xl font-mono text-blue-400">
                        {submissionsCount} / {totalPlayers}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
                <h1 className="text-2xl font-bold mb-4 text-center text-blue-400">Rank the Words</h1>

                <div className="max-w-3xl mx-auto space-y-2">
                    {TIERS.map(tier => (
                        <DroppableTier key={tier.id} id={tier.id} color={tier.color}>
                            {words.filter(w => rankings[w] === tier.id).map(w => (
                                <DraggableWord key={w} id={w} />
                            ))}
                        </DroppableTier>
                    ))}
                </div>

                {/* Pool for Unranked Words */}
                <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 border-t border-gray-700">
                    <DroppableTier id="pool" color="bg-gray-700">
                        {unrankedWords.map(w => (
                            <DraggableWord key={w} id={w} />
                        ))}
                    </DroppableTier>
                    
                     <div className="mt-4 flex justify-center">
                        <button
                            onClick={submitRanking}
                            disabled={!isComplete}
                            className={`
                                px-10 py-3 rounded-full text-xl font-bold transition shadow-lg
                                ${isComplete 
                                    ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105' 
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            Submit Ranking
                        </button>
                    </div>
                </div>
               
                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white text-gray-900 p-2 rounded shadow font-bold text-center opacity-80 rotate-3">
                            {activeId}
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
