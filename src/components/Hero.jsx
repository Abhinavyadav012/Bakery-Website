import { useCart } from '../context/CartContext';
import { PhoneIcon, CartIcon } from './icons';

// Hero Auth CTA Component
const HeroAuthCTA = () => {
    const { user } = useCart();
    
    if (user) return null;
    
    return (
        <div className="mt-10 animate-fade-in">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-center sm:text-left">
                    <p className="text-white font-medium mb-1">🎁 New here? Join our bakery family!</p>
                    <p className="text-brown-200 text-sm">Get 100 welcome points & exclusive member discounts</p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/login.html"
                        className="px-6 py-3 text-white border-2 border-white/50 rounded-full font-medium hover:bg-white/20 hover:border-white transition-all duration-300"
                    >
                        Sign In
                    </a>
                    <a
                        href="/signup.html"
                        className="px-6 py-3 bg-gold text-brown-900 rounded-full font-semibold hover:bg-yellow-400 hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                    >
                        <span>Create Account</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

// Hero Section
const Hero = () => {
    const { scrollToSection, setIsCartOpen, cartCount } = useCart();

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brown-900 via-brown-800 to-brown-700"></div>
            <div className="absolute inset-0 bg-pattern opacity-30"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920')] bg-cover bg-center opacity-20"></div>
            
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <div className="animate-bounce mb-6">
                    <span className="text-7xl md:text-8xl">🥖</span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                    Freshly Baked
                    <span className="block text-gold">Every Morning</span>
                </h1>
                <p className="text-xl md:text-2xl text-brown-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Artisanal breads, delicate pastries, and heavenly cakes crafted with love and the finest ingredients since 1985.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => scrollToSection('products')}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-brown-900 bg-gold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold/30"
                    >
                        <span className="relative z-10">Explore Our Menu</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                    <button
                        onClick={() => scrollToSection('contact')}
                        className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white hover:scale-105"
                    >
                        <PhoneIcon />
                        <span className="ml-2">Contact Us</span>
                    </button>
                </div>
                
                {/* Quick Order Badge */}
                {cartCount > 0 && (
                    <div className="mt-8 animate-fade-in">
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white hover:bg-white/30 transition-all duration-300"
                        >
                            <CartIcon />
                            <span>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
                            <span className="text-gold font-semibold">→ Checkout</span>
                        </button>
                    </div>
                )}
                
                {/* Login/Signup CTA */}
                <HeroAuthCTA />
            </div>
        </section>
    );
};

export default Hero;
