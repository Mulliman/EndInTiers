'use client';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Category } from '../types/game';

interface SelectionPhaseProps {
    socket: Socket;
    isChooser: boolean;
    chooserName?: string;
}

export default function SelectionPhase({ socket, isChooser, chooserName }: SelectionPhaseProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [step, setStep] = useState<'CATEGORY' | 'WORDS'>('CATEGORY');

    useEffect(() => {
        if (isChooser) {
            socket.emit('GET_CATEGORIES');
            socket.on('CATEGORIES_SENT', (data: Category[]) => {
                setCategories(data);
            });
        }
        return () => {
            socket.off('CATEGORIES_SENT');
        };
    }, [isChooser, socket]);

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setStep('WORDS');
        setSelectedWords([]); // Reset words if category changes (though we don't allow going back easily here yet)
    };

    const handleWordClick = (word: string) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(selectedWords.filter(w => w !== word));
        } else {
            if (selectedWords.length < 5) {
                setSelectedWords([...selectedWords, word]);
            }
        }
    };

    const confirmSelection = () => {
        if (selectedCategory && selectedWords.length === 5) {
            socket.emit('SET_WORDS', selectedCategory.name, selectedWords);
        }
    };

    if (!isChooser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <div className="animate-pulse text-center">
                    <h2 className="text-3xl font-bold mb-4">Waiting...</h2>
                    <p className="text-xl text-gray-400">{chooserName} is picking the category and words.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-8 text-blue-400">
                {step === 'CATEGORY' ? 'Choose a Category' : `Select 5 Words from: ${selectedCategory?.name}`}
            </h1>

            {step === 'CATEGORY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-6 text-xl font-semibold transition transform hover:scale-105"
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {step === 'WORDS' && selectedCategory && (
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {selectedCategory.words.map((word) => {
                            const isSelected = selectedWords.includes(word);
                            return (
                                <button
                                    key={word}
                                    onClick={() => handleWordClick(word)}
                                    className={`
                                        p-4 rounded-lg text-lg font-medium transition
                                        ${isSelected 
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                                    `}
                                >
                                    {word}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={confirmSelection}
                            disabled={selectedWords.length !== 5}
                            className={`
                                px-8 py-3 rounded-full text-xl font-bold transition
                                ${selectedWords.length === 5
                                    ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                            `}
                        >
                            Confirm Selection ({selectedWords.length}/5)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
