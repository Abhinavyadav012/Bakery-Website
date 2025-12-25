// Product Detail Page - Premium E-commerce Experience
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { Button, QuantitySelector } from './ui';
import { ProductDetailSkeleton } from './ui/Skeleton';
import { StarIcon, HeartIcon, HeartFilledIcon, CartIcon } from './icons';
import Navbar from './Navbar';
import Footer from './Footer';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, wishlist, setIsCartOpen, showNotification } = useCart();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const isWishlisted = product ? wishlist.includes(product.id) : false;

    useEffect(() => {
        // Simulate loading for smooth UX
        setLoading(true);
        const timer = setTimeout(() => {
            const foundProduct = products.find(p => p.id === parseInt(id));
            setProduct(foundProduct);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [id]);

    // Generate dummy images for gallery
    const productImages = product ? [
        product.image,
        product.image.replace('w=400', 'w=401'),
        product.image.replace('w=400', 'w=402'),
        product.image.replace('w=400', 'w=403'),
    ] : [];

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        showNotification(`Added ${quantity} ${product.name} to cart! 🛒`);
    };

    const handleBuyNow = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setIsCartOpen(true);
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    };

    // Related products
    const relatedProducts = product 
        ? products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
        : [];

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-cream flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center px-4">
                        <span className="text-8xl mb-6 block">🍞</span>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-brown-900 mb-4">
                            Product Not Found
                        </h1>
                        <p className="text-brown-600 mb-8 max-w-md mx-auto">
                            Sorry, we couldn't find the product you're looking for. 
                            It might have been removed or doesn't exist.
                        </p>
                        <Button onClick={() => navigate('/')} variant="primary" size="lg">
                            Back to Menu
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            
            <main className="flex-1 py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm mb-8 overflow-x-auto">
                        <Link 
                            to="/" 
                            className="text-brown-500 hover:text-gold transition-colors whitespace-nowrap"
                        >
                            Home
                        </Link>
                        <span className="text-brown-300">/</span>
                        <Link 
                            to="/#products" 
                            className="text-brown-500 hover:text-gold transition-colors whitespace-nowrap"
                        >
                            Products
                        </Link>
                        <span className="text-brown-300">/</span>
                        <span className="text-brown-800 font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div 
                                className="relative bg-white rounded-2xl overflow-hidden shadow-lg aspect-square cursor-zoom-in group"
                                onMouseEnter={() => setIsImageZoomed(true)}
                                onMouseLeave={() => setIsImageZoomed(false)}
                                onMouseMove={handleMouseMove}
                            >
                                {product.badge && (
                                    <span className={`absolute top-4 left-4 z-10 px-4 py-2 text-sm font-bold text-white rounded-full shadow-lg ${
                                        product.badge === 'Bestseller' ? 'bg-gold text-brown-900' :
                                        product.badge === 'New' ? 'bg-green-500' :
                                        product.badge === 'Limited' ? 'bg-red-500' :
                                        product.badge === 'Seasonal' ? 'bg-orange-500' :
                                        'bg-brown-600'
                                    }`}>
                                        {product.badge}
                                    </span>
                                )}
                                
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-4 right-4 z-10 p-3 bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    {isWishlisted ? <HeartFilledIcon /> : <HeartIcon />}
                                </button>

                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500"
                                    style={{
                                        transform: isImageZoomed ? 'scale(1.5)' : 'scale(1)',
                                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                                    }}
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {productImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                            selectedImage === index 
                                                ? 'border-gold shadow-lg scale-105' 
                                                : 'border-transparent hover:border-brown-200'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} view ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Category */}
                            <span className="inline-block px-4 py-1.5 bg-brown-100 text-brown-600 text-sm font-medium rounded-full uppercase tracking-wider">
                                {product.category}
                            </span>

                            {/* Name */}
                            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brown-900 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating & Reviews */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} filled={i < product.rating} />
                                    ))}
                                    <span className="ml-2 text-brown-700 font-medium">
                                        {product.rating}.0
                                    </span>
                                </div>
                                <span className="text-brown-400">|</span>
                                <span className="text-brown-500 text-sm">
                                    {Math.floor(Math.random() * 100 + 50)} Reviews
                                </span>
                                <span className="text-brown-400">|</span>
                                <span className="text-green-600 text-sm font-medium">
                                    ✓ In Stock
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl md:text-5xl font-bold text-gold">
                                    ₹{product.price}
                                </span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-xl text-brown-400 line-through">
                                            ₹{product.originalPrice}
                                        </span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-bold rounded">
                                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <div className="prose prose-brown">
                                <p className="text-brown-600 text-lg leading-relaxed">
                                    {product.description}
                                </p>
                                <p className="text-brown-500 mt-4">
                                    Made with love using premium ingredients and traditional baking techniques. 
                                    Our {product.name.toLowerCase()} is freshly prepared daily to ensure 
                                    the highest quality and taste.
                                </p>
                            </div>

                            {/* Divider */}
                            <hr className="border-brown-200" />

                            {/* Quantity & Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-brown-700 font-medium">Quantity:</span>
                                    <QuantitySelector
                                        value={quantity}
                                        onChange={setQuantity}
                                        min={1}
                                        max={10}
                                        size="lg"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        variant="secondary"
                                        size="lg"
                                        fullWidth
                                        icon={<CartIcon />}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={handleBuyNow}
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-center gap-3 text-brown-600">
                                    <span className="text-2xl">🚚</span>
                                    <span className="text-sm">Free delivery over ₹500</span>
                                </div>
                                <div className="flex items-center gap-3 text-brown-600">
                                    <span className="text-2xl">🥐</span>
                                    <span className="text-sm">Fresh baked daily</span>
                                </div>
                                <div className="flex items-center gap-3 text-brown-600">
                                    <span className="text-2xl">⏰</span>
                                    <span className="text-sm">Same day delivery</span>
                                </div>
                                <div className="flex items-center gap-3 text-brown-600">
                                    <span className="text-2xl">💯</span>
                                    <span className="text-sm">100% satisfaction</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <section className="mt-16 md:mt-24">
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-brown-900 mb-8">
                                You May Also Like
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {relatedProducts.map(relProduct => (
                                    <Link
                                        key={relProduct.id}
                                        to={`/product/${relProduct.id}`}
                                        className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={relProduct.image}
                                                alt={relProduct.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-brown-900 group-hover:text-gold transition-colors truncate">
                                                {relProduct.name}
                                            </h3>
                                            <p className="text-gold font-bold mt-1">₹{relProduct.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
