'use client';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Category, SubCategory, Topic } from '../types/game';
import Button from './ui/Button';
import Card from './ui/Card';
import Container from './ui/Container';

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
            socket.emit('SET_WORDS', selectedTopic.id, selectedOptions, selectedQuestion);
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
            <Container>
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className="text-7xl mb-4 animate-bounce">🤔</div>
                        <div className="absolute -top-2 -right-2 h-4 w-4 bg-blue-500 rounded-full animate-ping" />
                    </div>
                    <h2 className="text-4xl font-black text-white italic">Waiting...</h2>
                    <p className="text-xl text-blue-400 font-medium max-w-md mx-auto">
                        <span className="font-black text-white">{chooserName}</span> is carefully selecting the perfect topic and words.
                    </p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="justify-start py-20 px-4">
            <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <p className="text-blue-500 font-bold tracking-widest uppercase text-xs mb-1">Phase: Selection</p>
                        <h1 className="text-4xl font-black text-white">
                            {step === 'CATEGORY' && 'Pick a Category'}
                            {step === 'SUBCATEGORY' && `${selectedCategory?.name}`}
                            {step === 'TOPIC' && `${selectedSubCategory?.name}`}
                            {step === 'QUESTION' && `The Question`}
                            {step === 'OPTIONS' && `Select 5 Items`}
                        </h1>
                    </div>
                    {step !== 'CATEGORY' && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={goBack}
                        >
                            ← Back
                        </Button>
                    )}
                </div>

                {step === 'CATEGORY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((cat) => (
                            <Card 
                                key={cat.name} 
                                className="cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 group"
                                variant="glass"
                            >
                                <button
                                    onClick={() => handleCategoryClick(cat)}
                                    className="w-full h-full text-left"
                                >
                                    <h3 className="text-2xl font-black group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                                    <p className="text-gray-500 text-sm mt-2">{cat.subcategories.length} Collections available</p>
                                </button>
                            </Card>
                        ))}
                    </div>
                )}

                {step === 'SUBCATEGORY' && selectedCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedCategory.subcategories.map((sub) => (
                            <Card 
                                key={sub.name} 
                                className="cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 group"
                                variant="glass"
                            >
                                <button
                                    onClick={() => handleSubCategoryClick(sub)}
                                    className="w-full h-full text-left"
                                >
                                    <h3 className="text-2xl font-black group-hover:text-purple-400 transition-colors">{sub.name}</h3>
                                    <p className="text-gray-500 text-sm mt-2">{sub.topics.length} Topics ready</p>
                                </button>
                            </Card>
                        ))}
                    </div>
                )}

                {step === 'TOPIC' && selectedSubCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedSubCategory.topics.map((topic) => (
                            <Card 
                                key={topic.id} 
                                className="cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 group"
                                variant="glass"
                            >
                                <button
                                    onClick={() => handleTopicClick(topic)}
                                    className="w-full h-full text-left"
                                >
                                    <h3 className="text-xl font-black group-hover:text-pink-400 transition-colors">{topic.name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {topic.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            </Card>
                        ))}
                    </div>
                )}

                {step === 'QUESTION' && selectedTopic && (
                    <div className="flex flex-col gap-4">
                        {selectedTopic.questions.map((q) => (
                            <Button
                                key={q}
                                onClick={() => handleQuestionClick(q)}
                                variant="outline"
                                className="text-xl py-8 justify-start px-8 border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5"
                            >
                                {q}
                            </Button>
                        ))}
                    </div>
                )}

                {step === 'OPTIONS' && selectedTopic && (
                    <div className="w-full">
                        <Card variant="glass" className="mb-8 border-blue-500/30">
                             <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Selected Question</p>
                             <h2 className="text-2xl font-black italic">"{selectedQuestion}"</h2>
                        </Card>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                            {selectedTopic.options.map((option) => {
                                const isSelected = selectedOptions.includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionClick(option)}
                                        className={`
                                            p-4 rounded-xl text-sm font-bold transition-all transform active:scale-95
                                            ${isSelected 
                                                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-2 border-blue-400' 
                                                : 'bg-gray-900 border-2 border-gray-800 text-gray-400 hover:border-gray-700'}
                                        `}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-8 bg-gray-950/80 backdrop-blur-xl border-t border-gray-900 flex justify-center z-50">
                            <Button
                                onClick={confirmSelection}
                                disabled={selectedOptions.length !== 5}
                                variant="success"
                                size="xl"
                                className="shadow-[0_0_30px_rgba(22,163,74,0.3)]"
                            >
                                Confirm Selection ({selectedOptions.length}/5)
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}
