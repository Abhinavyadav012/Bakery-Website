import { useCart } from '../../context/CartContext';
import { CloseIcon, TrashIcon, MinusIcon, PlusIcon, CartIcon } from '../icons';

const CartSidebar = () => {
    const { 
        cart, 
        isCartOpen, 
        setIsCartOpen, 
        removeFromCart, 
        updateQuantity, 
        cartTotal, 
        cartCount,
        setIsCheckoutOpen
    } = useCart();

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsCartOpen(false)}
            />
            
            {/* Cart Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
                isCartOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-brown-100">
                        <h2 className="font-display text-2xl font-bold text-brown-900">Your Cart</h2>
                        <button 
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 hover:bg-brown-100 rounded-full transition-colors duration-300"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    
                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">🛒</span>
                                <h3 className="text-xl font-display font-bold text-brown-900 mb-2">Your cart is empty</h3>
                                <p className="text-brown-600 mb-6">Add some delicious items to get started!</p>
                                <button 
                                    onClick={() => setIsCartOpen(false)}
                                    className="px-6 py-3 bg-brown-800 text-white rounded-full hover:bg-gold hover:text-brown-900 transition-all duration-300"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 bg-cream rounded-xl p-4">
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-display font-bold text-brown-900">{item.name}</h4>
                                            <p className="text-gold font-semibold">₹{item.price}</p>
                                            <div className="flex items-center space-x-3 mt-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-brown-100 transition-colors duration-300"
                                                >
                                                    <MinusIcon />
                                                </button>
                                                <span className="font-medium text-brown-900 w-8 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-brown-100 transition-colors duration-300"
                                                >
                                                    <PlusIcon />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-brown-900">₹{item.price * item.quantity}</p>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 mt-2 transition-colors duration-300"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-brown-100 bg-cream">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-brown-600">Subtotal ({cartCount} items)</span>
                                <span className="text-2xl font-bold text-brown-900">₹{cartTotal}</span>
                            </div>
                            <p className="text-sm text-brown-500 mb-4">Shipping calculated at checkout</p>
                            <button 
                                onClick={() => {
                                    setIsCartOpen(false);
                                    setIsCheckoutOpen(true);
                                }}
                                className="w-full py-4 bg-gold text-brown-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2"
                            >
                                <CartIcon />
                                <span>Proceed to Checkout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
