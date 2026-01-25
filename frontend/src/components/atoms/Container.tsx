import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4 ${className}`}>
            {children}
        </div>
    );
}
