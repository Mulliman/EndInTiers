import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

export function WordItem({ id, isOverlay = false, isDragging = false }: { id: string, isOverlay?: boolean, isDragging?: boolean }) {
    return (
        <div 
            className={`
                bg-white text-gray-950 px-4 py-2 rounded-lg shadow-xl font-black text-sm uppercase tracking-tight
                cursor-grab active:cursor-grabbing touch-none select-none transition-all
                ${isOverlay ? 'opacity-90 rotate-2 scale-110' : 'hover:scale-105'}
                ${isDragging ? 'opacity-0' : 'opacity-100'}
            `}
        >
            {id}
        </div>
    );
}

export function DraggableWord({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
        >
            <WordItem id={id} isDragging={isDragging} />
        </div>
    );
}

export function DroppableTier({ id, children, color, shadow }: { id: string, children: React.ReactNode, color: string, shadow: string }) {
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
