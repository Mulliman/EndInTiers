'use client';
import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import Button from './ui/Button';
import Card from './ui/Card';
import Container from './ui/Container';

interface RankingPhaseProps {
    socket: Socket;
    words: string[];
    question?: string;
    hasSubmitted: boolean;
    submissionsCount: number;
    totalPlayers: number;
}

const TIERS = [
    { id: 'S', value: 4, color: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
    { id: 'A', value: 3, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' },
    { id: 'B', value: 2, color: 'from-yellow-500 to-yellow-600', shadow: 'shadow-yellow-500/20' },
    { id: 'C', value: 1, color: 'from-green-500 to-green-600', shadow: 'shadow-green-500/20' },
    { id: 'D', value: 0, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
];

function DraggableWord({ id, isOverlay = false }: { id: string, isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            className={`
                bg-white text-gray-950 px-4 py-2 rounded-lg shadow-xl font-black text-sm uppercase tracking-tight
                cursor-grab active:cursor-grabbing touch-none select-none transition-transform
                ${isOverlay ? 'opacity-90 rotate-2 scale-110' : 'hover:scale-105'}
            `}
        >
            {id}
        </div>
    );
}

function DroppableTier({ id, children, color, shadow }: { id: string, children: React.ReactNode, color: string, shadow: string }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div 
            ref={setNodeRef} 
            className={`
                flex items-center gap-4 mb-3 p-3 rounded-2xl transition-all duration-200
                ${isOver ? 'ring-4 ring-white/20 bg-white/10' : 'bg-white/5'}
                border border-white/10 min-h-[84px]
            `}
        >
            <div className={`
                w-12 h-12 flex items-center justify-center rounded-xl font-black text-2xl 
                bg-gradient-to-br ${color} text-white shadow-lg ${shadow}
            `}>
                {id}
            </div>
            <div className="flex-1 flex flex-wrap gap-2">
                {children}
            </div>
        </div>
    );
}

export default function RankingPhase({ socket, words, question, hasSubmitted, submissionsCount, totalPlayers }: RankingPhaseProps) {
    const [rankings, setRankings] = useState<Record<string, string>>({}); 
    const [activeId, setActiveId] = useState<string | null>(null);

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
            <Container>
                <Card variant="glass" className="text-center p-12">
                    <div className="text-6xl mb-6 animate-pulse">📤</div>
                    <h2 className="text-4xl font-black mb-2">Sent!</h2>
                    <p className="text-xl text-gray-500 mb-8 font-medium">Waiting for the others to finish...</p>
                    
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-5xl font-black text-blue-500 font-mono">
                            {submissionsCount}
                        </div>
                        <div className="text-2xl text-gray-700 font-black">/</div>
                        <div className="text-5xl font-black text-gray-300 font-mono">
                            {totalPlayers}
                        </div>
                    </div>
                </Card>
            </Container>
        );
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Container className="justify-start pt-12 pb-40 px-4">
                <div className="w-full max-w-2xl text-center mb-10">
                    <p className="text-blue-500 font-bold tracking-widest uppercase text-xs mb-1">Phase: Ranking</p>
                    <h1 className="text-3xl font-black text-white italic">
                        "{question || 'Rank these items based on your opinion'}"
                    </h1>
                </div>

                <div className="w-full max-w-2xl space-y-2">
                    {TIERS.map(tier => (
                        <DroppableTier key={tier.id} id={tier.id} color={tier.color} shadow={tier.shadow}>
                            {words.filter(w => rankings[w] === tier.id).map(w => (
                                <DraggableWord key={w} id={w} />
                            ))}
                        </DroppableTier>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-xl border-t border-gray-900 p-6 z-50">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 text-center md:text-left">Unranked Pool</div>
                            <div ref={useDroppable({ id: 'pool' }).setNodeRef} className="flex flex-wrap gap-2 justify-center md:justify-start min-h-[44px]">
                                {unrankedWords.map(w => (
                                    <DraggableWord key={w} id={w} />
                                ))}
                            </div>
                        </div>
                        
                        <Button
                            onClick={submitRanking}
                            disabled={!isComplete}
                            variant="success"
                            size="lg"
                            className="w-full md:w-auto min-w-[200px] shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                        >
                            Submit Rank
                        </Button>
                    </div>
                </div>
               
                <DragOverlay>
                    {activeId ? (
                        <DraggableWord id={activeId} isOverlay />
                    ) : null}
                </DragOverlay>
            </Container>
        </DndContext>
    );
}
