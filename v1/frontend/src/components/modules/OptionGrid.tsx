import React from 'react';
import Card from '../atoms/Card';

interface OptionGridProps {
    options: string[];
    selectedOptions: string[];
    onOptionClick: (option: string) => void;
    maxSelection?: number;
    columns?: number;
}

export default function OptionGrid({ 
    options, 
    selectedOptions, 
    onOptionClick,
    maxSelection = 5,
    columns = 3
}: OptionGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                const isDisabled = !isSelected && selectedOptions.length >= maxSelection;

                return (
                    <button
                        key={option}
                        onClick={() => onOptionClick(option)}
                        disabled={isDisabled}
                        className={`
                            p-4 rounded-xl text-sm font-bold transition-all transform active:scale-95 border-2
                            ${isSelected 
                                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-400' 
                                : isDisabled
                                    ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}
                        `}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}
