import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, CloseIcon, CartIcon, UserIcon, LogoutIcon } from './icons';

// User Profile Dropdown Component
const UserDropdown = () => {
    const { user, logout } = useAuth();
    const { wishlist, scrollToSection } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    if (!user) {
        return (
            <div className="flex items-center">
                <Link
                    to="/login"
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold to-yellow-400 text-brown-900 px-5 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Sign In</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-brown-100 px-3 py-2 rounded-full hover:bg-brown-200 transition-colors"
            >
                <span className="text-xl">{user.avatar || '👤'}</span>
                <span className="hidden sm:block font-medium text-brown-700">{user.firstName}</span>
                <svg className={`w-4 h-4 text-brown-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
                        <div className="p-4 bg-brown-50 border-b">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">{user.avatar || '👤'}</span>
                                <div>
                                    <p className="font-semibold text-brown-800">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-brown-500">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2">
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-brown-50 transition-colors text-left">
                                <span className="text-xl">📦</span>
                                <span className="text-brown-700">My Dashboard</span>
                            </Link>
                            <button 
                                onClick={() => { scrollToSection('products'); setIsOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-brown-50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">❤️</span>
                                    <span className="text-brown-700">Wishlist</span>
                                </div>
                                {wishlist?.length > 0 && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">
                                        {wishlist.length}
                                    </span>
                                )}
                            </button>
                            <Link to="/settings" onClick={() => setIsOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-brown-50 transition-colors text-left">
                                <span className="text-xl">⚙️</span>
                                <span className="text-brown-700">Settings</span>
                            </Link>
                            <Link to="/rewards" onClick={() => setIsOpen(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-brown-50 transition-colors text-left">
                                <span className="text-xl">🎁</span>
                                <span className="text-brown-700">Rewards</span>
                                <span className="bg-gold text-brown-900 text-xs px-2 py-1 rounded-full font-semibold">{user.rewards || 100} pts</span>
                            </Link>
                        </div>

                        <div className="p-2 border-t">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left text-red-600"
                            >
                                <LogoutIcon />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Mobile User Auth Component
const MobileUserAuth = ({ setIsNavOpen }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        setIsNavOpen(false);
    };

    if (!user) {
        return (
            <div className="flex flex-col space-y-2">
                <Link
                    to="/login"
                    onClick={() => setIsNavOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 border-2 border-brown-300 text-brown-700 px-5 py-3 rounded-full hover:bg-brown-50 transition-all duration-300"
                >
                    <UserIcon />
                    <span>Sign In</span>
                </Link>
                <Link
                    to="/signup"
                    onClick={() => setIsNavOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 bg-gold text-brown-900 px-5 py-3 rounded-full hover:bg-yellow-400 transition-all duration-300 font-semibold"
                >
                    <span>Create Account</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-brown-50 rounded-xl">
                <span className="text-3xl">{user.avatar || '👤'}</span>
                <div>
                    <p className="font-semibold text-brown-800">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-brown-500">{user.email}</p>
                </div>
            </div>
            <Link
                to="/dashboard"
                onClick={() => setIsNavOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-brown-100 text-brown-700 px-5 py-3 rounded-full hover:bg-brown-200 transition-all duration-300"
            >
                <span>My Dashboard</span>
            </Link>
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 text-red-600 px-5 py-3 rounded-full border-2 border-red-200 hover:bg-red-50 transition-all duration-300"
            >
                <LogoutIcon />
                <span>Sign Out</span>
            </button>
        </div>
    );
};

// Navigation Component
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const { cartCount, setIsCartOpen, scrollToSection } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            
            const sections = ['home', 'products', 'about', 'gallery', 'contact'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = ['Home', 'Products', 'About', 'Gallery', 'Contact'];

    const handleNavClick = (e, link) => {
        e.preventDefault();
        const sectionId = link.toLowerCase();
        scrollToSection(sectionId);
        setIsOpen(false);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-3xl">🥐</span>
                        <span className={`font-display text-2xl font-bold transition-colors duration-300 ${scrolled ? 'text-brown-800' : 'text-white'}`}>
                            Perfect Bakery
                        </span>
                    </a>

                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                onClick={(e) => handleNavClick(e, link)}
                                className={`relative font-medium transition-all duration-300 hover:text-gold group ${scrolled ? 'text-brown-700' : 'text-white'} ${activeSection === link.toLowerCase() ? 'text-gold' : ''}`}
                            >
                                {link}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300 ${activeSection === link.toLowerCase() ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            </a>
                        ))}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center space-x-2 bg-gradient-to-r from-brown-600 to-brown-700 text-white px-5 py-2.5 rounded-full hover:from-brown-700 hover:to-brown-800 transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
                        >
                            <CartIcon />
                            <span>Order Now</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-brown-900 rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <UserDropdown />
                    </div>

                    <div className="md:hidden flex items-center space-x-4">
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2"
                        >
                            <CartIcon />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-brown-900 rounded-full text-xs font-bold flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-brown-800' : 'text-white'}`}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="py-4 space-y-3 bg-white/95 backdrop-blur-md rounded-2xl mt-4 px-4 shadow-xl">
                        {navLinks.map((link) => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                className={`block py-2 transition-colors font-medium ${activeSection === link.toLowerCase() ? 'text-gold' : 'text-brown-700 hover:text-gold'}`}
                                onClick={(e) => handleNavClick(e, link)}
                            >
                                {link}
                            </a>
                        ))}
                        <button 
                            onClick={() => { setIsOpen(false); setIsCartOpen(true); }}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brown-600 to-brown-700 text-white px-5 py-3 rounded-full hover:from-brown-700 hover:to-brown-800 transition-all duration-300"
                        >
                            <CartIcon />
                            <span>View Cart ({cartCount})</span>
                        </button>
                        <div className="pt-2 border-t border-brown-200">
                            <MobileUserAuth setIsNavOpen={setIsOpen} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
