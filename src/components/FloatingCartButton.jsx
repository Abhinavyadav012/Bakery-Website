import { useCart } from '../context/CartContext';
import { CartIcon } from './icons';

const FloatingCartButton = () => {
    const { cartCount, setIsCartOpen, cartTotal } = useCart();

    if (cartCount === 0) return null;

    return (
        <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-gold text-brown-900 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 md:hidden"
        >
            <CartIcon />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-brown-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
            </span>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-brown-900 text-white px-2 py-1 rounded">
                ₹{cartTotal}
            </span>
        </button>
    );
};

export default FloatingCartButton;
