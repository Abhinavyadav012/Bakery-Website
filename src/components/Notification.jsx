// Premium Notification Component with Different Types
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

const Notification = () => {
    const { notification, clearNotification } = useCart();
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            setIsLeaving(false);
        }
    }, [notification]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            clearNotification?.();
        }, 300);
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(handleClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!notification || !isVisible) return null;

    // Determine notification type based on message content
    const getNotificationType = (msg) => {
        if (typeof msg !== 'string') return 'info';
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('error') || lowerMsg.includes('failed') || lowerMsg.includes('please login')) return 'error';
        if (lowerMsg.includes('success') || lowerMsg.includes('added') || lowerMsg.includes('placed')) return 'success';
        if (lowerMsg.includes('removed') || lowerMsg.includes('warning')) return 'warning';
        return 'info';
    };

    const type = getNotificationType(notification);

    const typeStyles = {
        success: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            icon: '✓',
            iconBg: 'bg-white/20'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-rose-600',
            icon: '✕',
            iconBg: 'bg-white/20'
        },
        warning: {
            bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
            icon: '!',
            iconBg: 'bg-white/20'
        },
        info: {
            bg: 'bg-gradient-to-r from-brown-800 to-brown-900',
            icon: '🥐',
            iconBg: 'bg-gold/20'
        }
    };

    const style = typeStyles[type];

    return (
        <div 
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
                isVisible && !isLeaving 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
            }`}
        >
            <div className={`${style.bg} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-md`}>
                <span className={`w-8 h-8 ${style.iconBg} rounded-full flex items-center justify-center text-lg font-bold`}>
                    {style.icon}
                </span>
                <span className="flex-1 font-medium text-sm">{notification}</span>
                <button 
                    onClick={handleClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Notification;
