import React from 'react';
import { DroppableTier, DraggableWord } from './RankingItems';

interface Tier {
    id: string;
    value: number;
    color: string;
    shadow: string;
}

interface TierBoardProps {
    tiers: Tier[];
    words: string[];
    rankings: Record<string, string>;
    isInteractive?: boolean;
}

export default function TierBoard({ tiers, words, rankings }: TierBoardProps) {
    return (
        <div className="w-full max-w-2xl space-y-2">
            {tiers.map(tier => (
                <DroppableTier 
                    key={tier.id} 
                    id={tier.id} 
                    color={tier.color} 
                    shadow={tier.shadow}
                >
                    {words.filter(w => rankings[w] === tier.id).map(w => (
                        <DraggableWord key={w} id={w} />
                    ))}
                </DroppableTier>
            ))}
        </div>
    );
}
