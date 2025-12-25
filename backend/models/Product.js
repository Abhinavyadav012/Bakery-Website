const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Cakes', 'Breads', 'Pastries', 'Cookies', 'Donuts', 'Pies', 'Cupcakes', 'Seasonal', 'Beverages']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
    },
    tags: [{
        type: String,
        enum: ['bestseller', 'new', 'sale', 'vegan', 'gluten-free', 'sugar-free', 'organic']
    }],
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    ingredients: [{
        type: String
    }],
    nutritionalInfo: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 }
    },
    preparationTime: {
        type: String,
        default: '30 mins'
    },
    servings: {
        type: String,
        default: '1 serving'
    }
}, {
    timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
