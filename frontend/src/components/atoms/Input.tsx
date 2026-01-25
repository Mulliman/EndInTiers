import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ 
    label, 
    error, 
    className = '', 
    ...props 
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    {label}
                </label>
            )}
            <input
                className={`
                    w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none transition 
                    placeholder:text-gray-500
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
