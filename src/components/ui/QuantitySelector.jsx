// Quantity Selector Component with Animations
import { useState } from 'react';

const QuantitySelector = ({ 
    value = 1, 
    onChange, 
    min = 1, 
    max = 99,
    size = 'md',
    disabled = false 
}) => {
    const [isAnimating, setIsAnimating] = useState(null);

    const handleChange = (newValue) => {
        if (disabled) return;
        
        const clampedValue = Math.min(Math.max(newValue, min), max);
        if (clampedValue !== value) {
            setIsAnimating(newValue > value ? 'up' : 'down');
            onChange(clampedValue);
            setTimeout(() => setIsAnimating(null), 200);
        }
    };

    const sizeClasses = {
        sm: {
            container: 'h-8',
            button: 'w-8 text-sm',
            value: 'w-10 text-sm',
        },
        md: {
            container: 'h-12',
            button: 'w-12 text-lg',
            value: 'w-14 text-lg',
        },
        lg: {
            container: 'h-14',
            button: 'w-14 text-xl',
            value: 'w-16 text-xl',
        },
    };

    const classes = sizeClasses[size];

    return (
        <div className={`
            inline-flex items-center rounded-xl border-2 border-brown-200 
            bg-white overflow-hidden transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold'}
            ${classes.container}
        `}>
            {/* Decrease Button */}
            <button
                type="button"
                onClick={() => handleChange(value - 1)}
                disabled={disabled || value <= min}
                className={`
                    ${classes.button} h-full flex items-center justify-center
                    text-brown-600 hover:bg-brown-100 hover:text-brown-800
                    transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent
                    active:scale-90
                `}
                aria-label="Decrease quantity"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>

            {/* Value Display */}
            <div className={`
                ${classes.value} h-full flex items-center justify-center
                font-bold text-brown-900 border-x-2 border-brown-100
                relative overflow-hidden
            `}>
                <span className={`
                    transition-all duration-200
                    ${isAnimating === 'up' ? 'animate-slide-up' : ''}
                    ${isAnimating === 'down' ? 'animate-slide-down' : ''}
                `}>
                    {value}
                </span>
            </div>

            {/* Increase Button */}
            <button
                type="button"
                onClick={() => handleChange(value + 1)}
                disabled={disabled || value >= max}
                className={`
                    ${classes.button} h-full flex items-center justify-center
                    text-brown-600 hover:bg-gold hover:text-brown-900
                    transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent
                    active:scale-90
                `}
                aria-label="Increase quantity"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
};

export default QuantitySelector;
