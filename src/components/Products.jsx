import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts, PRODUCT_CATEGORIES } from '../context/ProductContext';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';
import { SearchIcon, FilterIcon } from './icons';

const Products = () => {
    const { products: contextProducts, loading, error } = useProducts();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured');

    // Use context products if available, otherwise fall back to static data
    const products = contextProducts.length > 0 ? contextProducts : fallbackProducts;
    const categories = PRODUCT_CATEGORIES.length > 1 ? PRODUCT_CATEGORIES : fallbackCategories;

    const filteredProducts = useMemo(() => {
        let filtered = products.filter(product => {
            const matchesCategory = activeCategory === 'all' || 
                product.category?.toLowerCase() === activeCategory.toLowerCase();
            const matchesSearch = 
                product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        switch (sortBy) {
            case 'price-low':
                return [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high':
                return [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'rating':
                return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'name':
                return [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            default:
                return filtered;
        }
    }, [products, activeCategory, searchQuery, sortBy]);

    return (
        <section id="products" className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-gold font-medium tracking-widest uppercase text-sm">Our Menu</span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-brown-900 mt-2 mb-4">
                        Delicious Creations
                    </h2>
                    <p className="text-brown-600 max-w-2xl mx-auto">
                        Each item is crafted with passion using traditional recipes and the finest locally-sourced ingredients.
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brown-400" />
                        <input
                            type="text"
                            placeholder="Search for your favorite treats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-brown-200 focus:border-gold focus:outline-none transition-colors duration-300"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FilterIcon className="w-5 h-5 text-brown-600" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 rounded-full border-2 border-brown-200 focus:border-gold focus:outline-none transition-colors duration-300 bg-white"
                        >
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                activeCategory === category.id
                                    ? 'bg-brown-800 text-white shadow-lg'
                                    : 'bg-white text-brown-700 hover:bg-brown-100 shadow-md'
                            }`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-8 mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 inline-block">
                            <p className="text-red-600">Failed to load products. Showing cached data.</p>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                )}

                {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <span className="text-6xl mb-4 block">🔍</span>
                        <h3 className="text-2xl font-display font-bold text-brown-900 mb-2">No items found</h3>
                        <p className="text-brown-600">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Products;
