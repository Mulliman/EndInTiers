'use client';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Category, SubCategory, Topic } from '../../types/game';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import Container from '../atoms/Container';
import PhaseHeader from '../modules/PhaseHeader';
import SelectionGrid from '../modules/SelectionGrid';
import OptionGrid from '../modules/OptionGrid';

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
            <PhaseHeader 
                phase="Selection"
                title={
                    step === 'CATEGORY' ? 'Pick a Category' :
                    step === 'SUBCATEGORY' ? selectedCategory?.name :
                    step === 'TOPIC' ? selectedSubCategory?.name :
                    step === 'QUESTION' ? 'The Question' : 'Select 5 Items'
                }
                onBack={step !== 'CATEGORY' ? goBack : undefined}
            />

            {step === 'CATEGORY' && (
                <SelectionGrid 
                    items={categories.map(c => ({ id: c.name, name: c.name, description: `${c.subcategories.length} Collections` }))}
                    onSelect={(item) => handleCategoryClick(categories.find(c => c.name === item.id)!)}
                    hoverVariant="blue"
                />
            )}

            {step === 'SUBCATEGORY' && selectedCategory && (
                <SelectionGrid 
                    items={selectedCategory.subcategories.map(s => ({ id: s.name, name: s.name, description: `${s.topics.length} Topics` }))}
                    onSelect={(item) => handleSubCategoryClick(selectedCategory.subcategories.find(s => s.name === item.id)!)}
                    hoverVariant="purple"
                />
            )}

            {step === 'TOPIC' && selectedSubCategory && (
                <SelectionGrid 
                    items={selectedSubCategory.topics.map(t => ({ id: t.id, name: t.name, tags: t.tags }))}
                    onSelect={(item) => handleTopicClick(selectedSubCategory.topics.find(t => t.id === item.id)!)}
                    hoverVariant="pink"
                />
            )}

            {step === 'QUESTION' && selectedTopic && (
                <div className="flex flex-col gap-4 w-full max-w-4xl">
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
                <div className="w-full max-w-4xl">
                    <Card variant="glass" className="mb-10 border-blue-500/30">
                         <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Selected Question</p>
                         <h2 className="text-2xl font-black italic">"{selectedQuestion}"</h2>
                    </Card>

                    <OptionGrid 
                        options={selectedTopic.options}
                        selectedOptions={selectedOptions}
                        onOptionClick={handleOptionClick}
                    />

                    <div className="fixed bottom-0 left-0 right-0 p-8 bg-gray-950/80 backdrop-blur-xl border-t border-gray-900 flex justify-center z-50">
                        <Button
                            onClick={confirmSelection}
                            disabled={selectedOptions.length !== 5}
                            variant="primary"
                            size="big"
                        >
                            Confirm Selection ({selectedOptions.length}/5)
                        </Button>
                    </div>
                </div>
            )}
        </Container>
    );
}
