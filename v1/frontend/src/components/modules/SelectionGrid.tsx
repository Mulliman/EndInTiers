import React from 'react';
import Card from '../atoms/Card';

interface SelectionItem {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
}

interface SelectionGridProps {
    items: SelectionItem[];
    onSelect: (item: any) => void;
    hoverVariant?: 'blue' | 'purple' | 'pink';
}

export default function SelectionGrid({ items, onSelect, hoverVariant = 'blue' }: SelectionGridProps) {
    const variants = {
        blue: 'hover:border-blue-500/50 hover:bg-blue-500/5 group-hover:text-blue-400',
        purple: 'hover:border-purple-500/50 hover:bg-purple-500/5 group-hover:text-purple-400',
        pink: 'hover:border-pink-500/50 hover:bg-pink-500/5 group-hover:text-pink-400'
    };

    const textColors = {
        blue: 'group-hover:text-blue-400',
        purple: 'group-hover:text-purple-400',
        pink: 'group-hover:text-pink-400'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {items.map((item) => (
                <Card 
                    key={item.id} 
                    className={`cursor-pointer group transition-all duration-300 ${variants[hoverVariant].split(' group-hover')[0]}`}
                    variant="glass"
                >
                    <button
                        onClick={() => onSelect(item)}
                        className="w-full h-full text-left"
                    >
                        <h3 className={`text-2xl font-black transition-colors ${textColors[hoverVariant]}`}>
                            {item.name}
                        </h3>
                        {item.description && (
                            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </button>
                </Card>
            ))}
        </div>
    );
}
