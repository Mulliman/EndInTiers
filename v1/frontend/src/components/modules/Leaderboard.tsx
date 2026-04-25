import React from 'react';
import Card from '../atoms/Card';

interface Standing {
    id: string;
    name: string;
    score: number;
    isCurrentPlayer: boolean;
    isNextChooser?: boolean;
}

interface LeaderboardProps {
    standings: Standing[];
}

export default function Leaderboard({ standings }: LeaderboardProps) {
    return (
        <Card variant="default" className="border-gray-800 w-full">
            <h3 className="text-xl font-black mb-6 text-center text-purple-400 uppercase tracking-widest">Standings</h3>
            <ul className="space-y-3">
                {standings.map((p, idx) => (
                    <li key={p.id} className="group">
                        <div className={`
                            flex items-center justify-between p-3 rounded-xl transition-all
                            ${p.isCurrentPlayer ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-gray-900 border border-gray-800'}
                        `}>
                            <div className="flex items-center gap-3">
                                <span className={`
                                    font-black w-6 text-center
                                    ${idx === 0 ? 'text-yellow-500 text-xl' : 'text-gray-600'}
                                `}>
                                    {idx + 1}
                                </span>
                                <div className="flex flex-col">
                                    <span className={`font-bold ${p.isCurrentPlayer ? 'text-white' : 'text-gray-300'}`}>
                                        {p.name} {p.isCurrentPlayer && '(You)'}
                                    </span>
                                    {p.isNextChooser && (
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
    );
}
