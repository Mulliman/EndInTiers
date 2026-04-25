import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline' | 'glass';
}

export default function Card({ 
    children, 
    className = '', 
    variant = 'default' 
}: CardProps) {
    const baseStyles = 'rounded-xl shadow-2xl transition-all';
    
    const variants = {
        default: 'bg-gray-900 border border-gray-800 p-8',
        outline: 'border-2 border-gray-800 p-8',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10 p-8'
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
