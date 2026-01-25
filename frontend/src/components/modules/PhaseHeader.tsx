import React from 'react';
import Button from '../atoms/Button';

interface PhaseHeaderProps {
    phase: string;
    title: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
    onBack?: () => void;
}

export default function PhaseHeader({ phase, title, subtitle, onBack }: PhaseHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-12 w-full max-w-4xl">
            <div>
                <p className="text-blue-500 font-bold tracking-widest uppercase text-[10px] mb-1">Phase: {phase}</p>
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black text-white">{title}</h1>
                    {subtitle && (
                        <div className="text-gray-400 font-medium">
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
            {onBack && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onBack}
                    className="border-gray-800"
                >
                    ← Back
                </Button>
            )}
        </div>
    );
}
