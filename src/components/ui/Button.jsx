// Premium Button Component with Variants
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const baseClasses = `
        inline-flex items-center justify-center gap-2 font-semibold
        rounded-full transition-all duration-300 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transform active:scale-95
    `;

    const variants = {
        primary: `
            bg-gold text-brown-900 hover:bg-yellow-400 
            hover:shadow-lg hover:shadow-gold/25
            focus:ring-gold
        `,
        secondary: `
            bg-brown-800 text-white hover:bg-brown-900
            hover:shadow-lg
            focus:ring-brown-800
        `,
        outline: `
            border-2 border-brown-800 text-brown-800 bg-transparent
            hover:bg-brown-800 hover:text-white
            focus:ring-brown-800
        `,
        ghost: `
            text-brown-700 bg-transparent hover:bg-brown-100
            focus:ring-brown-300
        `,
        danger: `
            bg-red-500 text-white hover:bg-red-600
            hover:shadow-lg
            focus:ring-red-500
        `,
        success: `
            bg-green-500 text-white hover:bg-green-600
            hover:shadow-lg
            focus:ring-green-500
        `,
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseClasses}
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <>
                    <svg 
                        className="animate-spin h-5 w-5" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" cy="12" r="10" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            fill="none"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    {children}
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </button>
    );
};

export default Button;
