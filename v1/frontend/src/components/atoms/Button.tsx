import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'outline';
    size?: 'big' | 'normal' | 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

export default function Button({ 
    children, 
    className = '', 
    variant = 'primary', 
    size = 'normal',
    isLoading = false,
    disabled,
    style,
    ...props 
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-white';
    
    // Gradient definitions
    const borderGradient = 'linear-gradient(to bottom right, #FF0000 0%, #FFA500 20%, #FFFF00 40%, #008000 60%, #0000FF 80%, #0000FF 100%)';
    const bgGradientPrimary = 'linear-gradient(to right, #2c0000ff, #3f1f11ff, #423104ff, #012401ff, #00002eff)';
    const bgTranslucent = 'linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))';

    let customStyle: React.CSSProperties = { ...style };
    let variantClasses = '';

    // Handle new variants with custom styles
    if (variant === 'primary') {
        customStyle = {
            ...customStyle,
            border: '4px solid transparent',
            backgroundImage: `${bgGradientPrimary}, ${borderGradient}`,
            backgroundOrigin: 'padding-box, border-box',
            backgroundClip: 'padding-box, border-box',
        };
        // Ensure bold white text is covered by baseStyles
    } else if (variant === 'secondary') {
        customStyle = {
            ...customStyle,
            border: '4px solid transparent',
            backgroundImage: `${bgTranslucent}, ${borderGradient}`,
            backgroundOrigin: 'padding-box, border-box',
            backgroundClip: 'padding-box, border-box',
        };
    } else if (variant === 'tertiary') {
        variantClasses = 'bg-white/20 hover:bg-white/30 text-white';
    } else {
        // Fallback to old variants classes
        const oldVariants = {
            success: 'bg-green-600 hover:bg-green-700',
            danger: 'bg-red-600 hover:bg-red-700',
            outline: 'border-2 border-gray-700 hover:bg-gray-800 shadow-none'
        };
        variantClasses = oldVariants[variant as keyof typeof oldVariants] || 'bg-blue-600';
    }

    // Handle sizes
    let sizeClasses = '';
    if (size === 'big') {
        sizeClasses = 'px-8 py-4 text-2xl rounded-xl'; // Big: larger padding/text
    } else if (size === 'normal') {
        sizeClasses = 'px-6 py-2 text-lg rounded-lg'; // Normal: smaller than big
    } else {
        const oldSizes = {
            sm: 'px-4 py-2 text-sm rounded-md',
            md: 'px-6 py-3 text-base rounded-lg',
            lg: 'px-8 py-4 text-lg rounded-lg',
            xl: 'px-12 py-5 text-xl rounded-full'
        };
        sizeClasses = oldSizes[size as keyof typeof oldSizes] || 'px-6 py-3';
    }

    return (
        <button 
            className={`${baseStyles} ${variantClasses} ${sizeClasses} ${className}`}
            disabled={disabled || isLoading}
            style={customStyle}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
}
