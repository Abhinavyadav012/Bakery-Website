 // Premium Product Card with Clickable Navigation and Micro-interactions
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { StarIcon, HeartIcon, HeartFilledIcon, CartIcon } from './icons';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, wishlist, toggleWishlist, user } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const isWishlisted = wishlist.includes(product.id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsAdding(true);
        addToCart(product);
        
        // Reset animation after delay
        setTimeout(() => setIsAdding(false), 600);
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <article 
            onClick={handleCardClick}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative cursor-pointer"
        >
            {/* Badge */}
            {product.badge && (
                <span className={`absolute top-4 left-4 z-20 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md transform transition-transform duration-300 group-hover:scale-110 ${
                    product.badge === 'Bestseller' ? 'bg-gold text-brown-900' :
                    product.badge === 'New' ? 'bg-green-500' :
                    product.badge === 'Limited' ? 'bg-red-500' :
                    product.badge === 'Seasonal' ? 'bg-orange-500' :
                    product.badge === 'Popular' ? 'bg-purple-500' :
                    'bg-brown-600'
                }`}>
                    {product.badge}
                </span>
            )}
            
            {/* Wishlist Button */}
            <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 z-20 p-2.5 bg-white rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    isWishlisted ? 'text-red-500' : 'text-brown-400 hover:text-red-400'
                }`}
                title={user ? (isWishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to add to wishlist'}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                {isWishlisted ? <HeartFilledIcon /> : <HeartIcon />}
            </button>
            
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-[4/3]">
                {/* Skeleton while loading */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brown-100 via-brown-50 to-brown-100 animate-pulse" />
                )}
                
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Quick View Button - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-brown-900 font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                        View Details
                    </span>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-5 md:p-6">
                {/* Category and Rating */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-brown-500 uppercase tracking-wider">
                        {product.category}
                    </span>
                    <div className="flex items-center gap-1">
                        <StarIcon filled />
                        <span className="text-sm font-medium text-brown-700">{product.rating}</span>
                    </div>
                </div>
                
                {/* Product Name */}
                <h3 className="font-display text-lg md:text-xl font-bold text-brown-900 mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
                    {product.name}
                </h3>
                
                {/* Description */}
                <p className="text-brown-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                </p>
                
                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-bold text-gold">₹{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-xs text-brown-400 line-through">₹{product.originalPrice}</span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className={`flex items-center gap-2 bg-brown-800 text-white px-4 py-2.5 rounded-full transition-all duration-300 hover:bg-gold hover:text-brown-900 hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                            isAdding ? 'scale-110 bg-green-500 hover:bg-green-500' : ''
                        }`}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <span className={`transition-transform duration-300 ${isAdding ? 'animate-bounce' : ''}`}>
                            <CartIcon />
                        </span>
                        <span className="font-medium text-sm hidden sm:inline">
                            {isAdding ? 'Added!' : 'Add'}
                        </span>
                    </button>
                </div>
            </div>
            
            {/* Bottom accent line - animates on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-yellow-400 to-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </article>
    );
};

export default ProductCard;
