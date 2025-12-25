// Premium Toast Notification Component with Actions
import { useState, useEffect, useCallback } from 'react';

// Toast Types with styling
const TOAST_TYPES = {
    success: {
        icon: '✓',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconBg: 'bg-green-500',
    },
    error: {
        icon: '✕',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconBg: 'bg-red-500',
    },
    warning: {
        icon: '!',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconBg: 'bg-yellow-500',
    },
    info: {
        icon: 'i',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconBg: 'bg-blue-500',
    },
    cart: {
        icon: '🛒',
        bgColor: 'bg-brown-50',
        borderColor: 'border-gold',
        textColor: 'text-brown-800',
        iconBg: 'bg-gold',
    },
};

const Toast = ({ 
    message, 
    type = 'info', 
    duration = 4000, 
    onClose, 
    action,
    actionLabel = 'Retry',
    position = 'bottom-center' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const config = TOAST_TYPES[type] || TOAST_TYPES.info;

    const handleClose = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto-dismiss
        if (duration > 0) {
            const timer = setTimeout(handleClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, handleClose]);

    const positionClasses = {
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
    };

    return (
        <div 
            className={`fixed z-[100] transition-all duration-300 ease-out ${positionClasses[position]} ${
                isVisible && !isLeaving 
                    ? 'opacity-100 translate-y-0' 
                    : position.includes('top') 
                        ? 'opacity-0 -translate-y-4' 
                        : 'opacity-0 translate-y-4'
            }`}
        >
            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-2
                ${config.bgColor} ${config.borderColor} ${config.textColor}
                min-w-[280px] max-w-md backdrop-blur-sm
            `}>
                {/* Icon */}
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${config.iconBg}
                `}>
                    {config.icon}
                </div>

                {/* Message */}
                <p className="flex-1 font-medium text-sm">{message}</p>

                {/* Action Button */}
                {action && (
                    <button
                        onClick={() => {
                            action();
                            handleClose();
                        }}
                        className={`
                            px-3 py-1.5 rounded-lg font-semibold text-xs
                            bg-white/80 hover:bg-white transition-colors duration-200
                            border border-current/20
                        `}
                    >
                        {actionLabel}
                    </button>
                )}

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="p-1 rounded-lg hover:bg-black/5 transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Toast Container for multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] space-y-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ 
                        transform: `translateY(${-index * 8}px) scale(${1 - index * 0.02})`,
                        zIndex: 100 - index 
                    }}
                >
                    <Toast
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default Toast;
