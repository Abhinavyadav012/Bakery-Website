import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';

const ProductContext = createContext(null);

// Product categories for consistent use
export const PRODUCT_CATEGORIES = [
    { id: 'all', name: 'All', icon: '🍰' },
    { id: 'bread', name: 'Bread', icon: '🍞' },
    { id: 'pastry', name: 'Pastry', icon: '🥐' },
    { id: 'cake', name: 'Cake', icon: '🎂' },
    { id: 'cookie', name: 'Cookies', icon: '🍪' },
    { id: 'muffin', name: 'Muffin', icon: '🧁' },
    { id: 'tart', name: 'Tart', icon: '🥧' },
];

// Get category emoji helper
export const getCategoryEmoji = (category) => {
    const cat = PRODUCT_CATEGORIES.find(
        c => c.id === category?.toLowerCase() || c.name.toLowerCase() === category?.toLowerCase()
    );
    return cat?.icon || '🍰';
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    // Fetch all products from backend
    const fetchProducts = useCallback(async (force = false) => {
        // Only refetch if forced or data is stale (older than 30 seconds)
        if (!force && lastFetched && Date.now() - lastFetched < 30000 && products.length > 0) {
            return products;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await productsAPI.getAll();
            
            if (response.success) {
                const fetchedProducts = response.products || response.data || [];
                setProducts(fetchedProducts);
                setLastFetched(Date.now());
                return fetchedProducts;
            } else {
                throw new Error(response.message || 'Failed to fetch products');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
            // Return existing products on error
            return products;
        } finally {
            setLoading(false);
        }
    }, [lastFetched, products]);

    // Initial fetch on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Add a new product
    const addProduct = async (productData) => {
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (data.success) {
                const newProduct = data.product || data.data;
                setProducts(prev => [...prev, newProduct]);
                return { success: true, product: newProduct };
            } else {
                throw new Error(data.message || 'Failed to add product');
            }
        } catch (err) {
            console.error('Error adding product:', err);
            return { success: false, message: err.message };
        }
    };

    // Update an existing product
    const updateProduct = async (productId, productData) => {
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (data.success) {
                const updatedProduct = data.product || data.data;
                setProducts(prev => 
                    prev.map(p => p._id === productId || p.id === productId ? updatedProduct : p)
                );
                return { success: true, product: updatedProduct };
            } else {
                throw new Error(data.message || 'Failed to update product');
            }
        } catch (err) {
            console.error('Error updating product:', err);
            return { success: false, message: err.message };
        }
    };

    // Delete a product
    const deleteProduct = async (productId) => {
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setProducts(prev => prev.filter(p => p._id !== productId && p.id !== productId));
                return { success: true };
            } else {
                throw new Error(data.message || 'Failed to delete product');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            return { success: false, message: err.message };
        }
    };

    // Get product by ID
    const getProductById = (productId) => {
        return products.find(p => p._id === productId || p.id === productId);
    };

    // Get products by category
    const getProductsByCategory = (category) => {
        if (!category || category === 'all') return products;
        return products.filter(p => 
            p.category?.toLowerCase() === category.toLowerCase()
        );
    };

    // Search products
    const searchProducts = (query) => {
        if (!query) return products;
        const lowerQuery = query.toLowerCase();
        return products.filter(p => 
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.category?.toLowerCase().includes(lowerQuery)
        );
    };

    // Get product stats
    const getStats = () => {
        return {
            total: products.length,
            inStock: products.filter(p => (p.stock || 0) > 10).length,
            lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length,
            outOfStock: products.filter(p => (p.stock || 0) === 0).length,
            categories: [...new Set(products.map(p => p.category))].filter(Boolean).length,
        };
    };

    const value = {
        products,
        loading,
        error,
        categories: PRODUCT_CATEGORIES,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsByCategory,
        searchProducts,
        getStats,
        getCategoryEmoji,
        refreshProducts: () => fetchProducts(true),
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

// Custom hook to use product context
export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};

export default ProductContext;
