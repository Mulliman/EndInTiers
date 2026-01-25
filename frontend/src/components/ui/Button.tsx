import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

export default function Button({ 
    children, 
    className = '', 
    variant = 'primary', 
    size = 'md',
    isLoading = false,
    disabled,
    ...props 
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg';
    
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-purple-600 hover:bg-purple-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        outline: 'border-2 border-gray-700 hover:bg-gray-800 text-white shadow-none'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-12 py-5 text-xl rounded-full'
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
}
