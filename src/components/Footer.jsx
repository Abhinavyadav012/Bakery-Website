import { useCart } from '../context/CartContext';
import { contactInfo, socialLinks } from '../data/products.js';
import { PhoneIcon, EmailIcon, LocationIcon } from './icons';

const Footer = () => {
    const { scrollToSection } = useCart();

    return (
        <footer className="bg-brown-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-4xl">🥖</span>
                            <h3 className="font-display text-2xl font-bold text-gold">Perfect Bakery</h3>
                        </div>
                        <p className="text-brown-300 mb-6">
                            Crafting delicious memories since 1985. Every bite tells a story of passion, tradition, and the finest ingredients.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    className="w-10 h-10 bg-brown-800 rounded-full flex items-center justify-center hover:bg-gold hover:text-brown-900 transition-all duration-300"
                                    aria-label={social.name}
                                >
                                    <span>{social.icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display text-lg font-bold text-gold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {['Home', 'Products', 'About', 'Gallery', 'Contact'].map((link) => (
                                <li key={link}>
                                    <button
                                        onClick={() => scrollToSection(link.toLowerCase())}
                                        className="text-brown-300 hover:text-gold transition-colors duration-300"
                                    >
                                        {link}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Categories */}
                    <div>
                        <h4 className="font-display text-lg font-bold text-gold mb-4">Categories</h4>
                        <ul className="space-y-2">
                            {['Breads', 'Pastries', 'Cakes', 'Cookies', 'Beverages'].map((category) => (
                                <li key={category}>
                                    <button
                                        onClick={() => scrollToSection('products')}
                                        className="text-brown-300 hover:text-gold transition-colors duration-300"
                                    >
                                        {category}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Contact */}
                    <div>
                        <h4 className="font-display text-lg font-bold text-gold mb-4">Contact Info</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <LocationIcon className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                                <a 
                                    href={contactInfo.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brown-300 hover:text-gold transition-colors duration-300"
                                >
                                    {contactInfo.address}
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <PhoneIcon className="w-5 h-5 text-gold flex-shrink-0" />
                                <a 
                                    href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                                    className="text-brown-300 hover:text-gold transition-colors duration-300"
                                >
                                    {contactInfo.phone}
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <EmailIcon className="w-5 h-5 text-gold flex-shrink-0" />
                                <a 
                                    href={`mailto:${contactInfo.email}`}
                                    className="text-brown-300 hover:text-gold transition-colors duration-300"
                                >
                                    {contactInfo.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Bottom Bar */}
                <div className="border-t border-brown-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-brown-400 text-sm">
                        © {new Date().getFullYear()} Perfect Bakery Store. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-brown-400 hover:text-gold text-sm transition-colors duration-300">Privacy Policy</a>
                        <a href="#" className="text-brown-400 hover:text-gold text-sm transition-colors duration-300">Terms of Service</a>
                        <a href="#" className="text-brown-400 hover:text-gold text-sm transition-colors duration-300">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
