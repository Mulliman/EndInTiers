import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

export function DraggableWord({ id, isOverlay = false }: { id: string, isOverlay?: boolean }) {
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
