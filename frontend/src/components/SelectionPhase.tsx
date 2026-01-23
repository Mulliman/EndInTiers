'use client';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Category, SubCategory, Topic } from '../types/game';

interface SelectionPhaseProps {
    socket: Socket;
    isChooser: boolean;
    chooserName?: string;
}

type Step = 'CATEGORY' | 'SUBCATEGORY' | 'TOPIC' | 'QUESTION' | 'OPTIONS';

export default function SelectionPhase({ socket, isChooser, chooserName }: SelectionPhaseProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string>('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [step, setStep] = useState<Step>('CATEGORY');

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
        setStep('SUBCATEGORY');
    };

    const handleSubCategoryClick = (sub: SubCategory) => {
        setSelectedSubCategory(sub);
        setStep('TOPIC');
    };

    const handleTopicClick = (topic: Topic) => {
        setSelectedTopic(topic);
        if (topic.questions.length === 1) {
            setSelectedQuestion(topic.questions[0]);
            setStep('OPTIONS');
        } else {
            setStep('QUESTION');
        }
    };

    const handleQuestionClick = (question: string) => {
        setSelectedQuestion(question);
        setStep('OPTIONS');
    };

    const handleOptionClick = (option: string) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(o => o !== option));
        } else {
            if (selectedOptions.length < 5) {
                setSelectedOptions([...selectedOptions, option]);
            }
        }
    };

    const confirmSelection = () => {
        if (selectedTopic && selectedOptions.length === 5) {
            socket.emit('SET_WORDS', selectedTopic.name, selectedOptions, selectedQuestion);
        }
    };

    const goBack = () => {
        if (step === 'SUBCATEGORY') setStep('CATEGORY');
        else if (step === 'TOPIC') setStep('SUBCATEGORY');
        else if (step === 'QUESTION') setStep('TOPIC');
        else if (step === 'OPTIONS') {
            if (selectedTopic && selectedTopic.questions.length > 1) {
                setStep('QUESTION');
            } else {
                setStep('TOPIC');
            }
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
            <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-blue-400">
                        {step === 'CATEGORY' && 'Choose a Category'}
                        {step === 'SUBCATEGORY' && `Browse ${selectedCategory?.name}`}
                        {step === 'TOPIC' && `Select a Topic in ${selectedSubCategory?.name}`}
                        {step === 'QUESTION' && `Pick a Question for ${selectedTopic?.name}`}
                        {step === 'OPTIONS' && `Select 5 Options`}
                    </h1>
                    {step !== 'CATEGORY' && (
                        <button 
                            onClick={goBack}
                            className="text-gray-400 hover:text-white underline"
                        >
                            Back
                        </button>
                    )}
                </div>

                {step === 'CATEGORY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => handleCategoryClick(cat)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-6 text-xl font-semibold transition transform hover:scale-105"
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {step === 'SUBCATEGORY' && selectedCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCategory.subcategories.map((sub) => (
                            <button
                                key={sub.name}
                                onClick={() => handleSubCategoryClick(sub)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-6 text-xl font-semibold transition transform hover:scale-105"
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {step === 'TOPIC' && selectedSubCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedSubCategory.topics.map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => handleTopicClick(topic)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-6 text-xl font-semibold transition transform hover:scale-105 text-left"
                            >
                                <div className="text-lg">{topic.name}</div>
                                <div className="text-sm text-gray-400 mt-1">{topic.tags.join(', ')}</div>
                            </button>
                        ))}
                    </div>
                )}

                {step === 'QUESTION' && selectedTopic && (
                    <div className="flex flex-col gap-4">
                        {selectedTopic.questions.map((q) => (
                            <button
                                key={q}
                                onClick={() => handleQuestionClick(q)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-6 text-xl font-semibold transition text-left"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {step === 'OPTIONS' && selectedTopic && (
                    <div className="w-full">
                        <p className="text-xl text-center mb-6 text-gray-300 italic">
                            "{selectedQuestion}"
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {selectedTopic.options.map((option) => {
                                const isSelected = selectedOptions.includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionClick(option)}
                                        className={`
                                            p-4 rounded-lg text-lg font-medium transition
                                            ${isSelected 
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                                        `}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={confirmSelection}
                                disabled={selectedOptions.length !== 5}
                                className={`
                                    px-8 py-3 rounded-full text-xl font-bold transition
                                    ${selectedOptions.length === 5
                                        ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                Confirm Selection ({selectedOptions.length}/5)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
