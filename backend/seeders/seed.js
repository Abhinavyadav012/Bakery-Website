/**
 * Database Seeder
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const users = [
    {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@perfectbakery.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
        rewards: 500
    },
    {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer',
        isEmailVerified: true,
        rewards: 150
    }
];

const products = [
    {
        name: 'Classic Chocolate Cake',
        description: 'Rich, moist chocolate cake with layers of creamy chocolate ganache. Perfect for celebrations or as a delicious treat.',
        price: 599,
        originalPrice: 699,
        category: 'Cakes',
        tags: ['bestseller'],
        rating: 4.9,
        numReviews: 234,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        ingredients: ['Dark Chocolate', 'Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla Extract'],
        nutritionalInfo: { calories: 350, protein: 5, carbs: 45, fat: 18 },
        preparationTime: '45 mins',
        servings: '8 servings',
        isFeatured: true
    },
    {
        name: 'Red Velvet Dream',
        description: 'Velvety smooth red cake with cream cheese frosting. A classic favorite with a stunning presentation.',
        price: 699,
        category: 'Cakes',
        tags: ['new', 'premium'],
        rating: 4.8,
        numReviews: 156,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400',
        ingredients: ['Cocoa', 'Red Food Color', 'Buttermilk', 'Cream Cheese', 'Vanilla'],
        nutritionalInfo: { calories: 380, protein: 4, carbs: 48, fat: 20 },
        preparationTime: '50 mins',
        servings: '10 servings',
        isFeatured: true
    },
    {
        name: 'Artisan Sourdough Bread',
        description: 'Traditional sourdough bread made with our 50-year-old starter. Crusty exterior with a soft, tangy interior.',
        price: 149,
        category: 'Breads',
        tags: ['bestseller', 'organic'],
        rating: 4.7,
        numReviews: 312,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        ingredients: ['Organic Flour', 'Water', 'Salt', 'Sourdough Starter'],
        nutritionalInfo: { calories: 120, protein: 4, carbs: 24, fat: 1 },
        preparationTime: '24 hours',
        servings: '12 slices',
        isFeatured: true
    },
    {
        name: 'Butter Croissant',
        description: 'Flaky, buttery French croissant. Light and airy with golden layers that melt in your mouth.',
        price: 89,
        category: 'Pastries',
        tags: ['bestseller'],
        rating: 4.9,
        numReviews: 445,
        stock: 200,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
        ingredients: ['French Butter', 'Flour', 'Milk', 'Sugar', 'Yeast'],
        nutritionalInfo: { calories: 280, protein: 5, carbs: 32, fat: 15 },
        preparationTime: '30 mins',
        servings: '1 piece'
    },
    {
        name: 'Chocolate Chip Cookies',
        description: 'Crispy on the outside, chewy on the inside. Loaded with premium Belgian chocolate chips.',
        price: 199,
        originalPrice: 249,
        category: 'Cookies',
        tags: ['sale', 'bestseller'],
        rating: 4.8,
        numReviews: 523,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
        ingredients: ['Belgian Chocolate', 'Brown Sugar', 'Butter', 'Vanilla', 'Eggs'],
        nutritionalInfo: { calories: 180, protein: 2, carbs: 22, fat: 10 },
        preparationTime: '15 mins',
        servings: '6 cookies'
    },
    {
        name: 'Glazed Donuts',
        description: 'Light and fluffy yeast donuts with a sweet vanilla glaze. A breakfast classic.',
        price: 49,
        category: 'Donuts',
        tags: ['new'],
        rating: 4.6,
        numReviews: 287,
        stock: 120,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
        ingredients: ['Flour', 'Yeast', 'Sugar', 'Milk', 'Vanilla Glaze'],
        nutritionalInfo: { calories: 220, protein: 3, carbs: 30, fat: 10 },
        preparationTime: '10 mins',
        servings: '1 donut'
    },
    {
        name: 'Classic Apple Pie',
        description: 'Traditional American apple pie with cinnamon-spiced filling and flaky crust.',
        price: 449,
        category: 'Pies',
        tags: ['new'],
        rating: 4.7,
        numReviews: 178,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400',
        ingredients: ['Fresh Apples', 'Cinnamon', 'Nutmeg', 'Brown Sugar', 'Butter Crust'],
        nutritionalInfo: { calories: 320, protein: 3, carbs: 45, fat: 14 },
        preparationTime: '1 hour',
        servings: '8 slices'
    },
    {
        name: 'Vanilla Bean Cupcakes',
        description: 'Moist vanilla cupcakes topped with swirls of vanilla buttercream.',
        price: 79,
        category: 'Cupcakes',
        tags: [],
        rating: 4.5,
        numReviews: 234,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400',
        ingredients: ['Vanilla Bean', 'Butter', 'Sugar', 'Eggs', 'Buttercream'],
        nutritionalInfo: { calories: 250, protein: 3, carbs: 32, fat: 12 },
        preparationTime: '25 mins',
        servings: '1 cupcake'
    },
    {
        name: 'Blueberry Muffins',
        description: 'Soft, fluffy muffins bursting with fresh blueberries. Perfect breakfast treat.',
        price: 69,
        category: 'Pastries',
        tags: ['vegan'],
        rating: 4.6,
        numReviews: 189,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
        ingredients: ['Fresh Blueberries', 'Flour', 'Almond Milk', 'Maple Syrup'],
        nutritionalInfo: { calories: 200, protein: 4, carbs: 38, fat: 5 },
        preparationTime: '30 mins',
        servings: '1 muffin'
    },
    {
        name: 'Cinnamon Rolls',
        description: 'Soft, gooey cinnamon rolls with cream cheese frosting. Best served warm.',
        price: 129,
        category: 'Pastries',
        tags: ['bestseller'],
        rating: 4.9,
        numReviews: 367,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1609127344289-cb7ab81d13c2?w=400',
        ingredients: ['Cinnamon', 'Brown Sugar', 'Butter', 'Cream Cheese', 'Vanilla'],
        nutritionalInfo: { calories: 340, protein: 5, carbs: 48, fat: 15 },
        preparationTime: '40 mins',
        servings: '1 roll',
        isFeatured: true
    },
    {
        name: 'Chocolate Eclair',
        description: 'French pastry filled with vanilla custard, topped with rich chocolate ganache.',
        price: 99,
        category: 'Pastries',
        tags: ['premium'],
        rating: 4.7,
        numReviews: 145,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400',
        ingredients: ['Choux Pastry', 'Vanilla Custard', 'Dark Chocolate'],
        nutritionalInfo: { calories: 280, protein: 6, carbs: 35, fat: 14 },
        preparationTime: '20 mins',
        servings: '1 eclair'
    },
    {
        name: 'Whole Wheat Bread',
        description: 'Nutritious whole wheat bread, perfect for sandwiches and toast.',
        price: 99,
        category: 'Breads',
        tags: ['organic'],
        rating: 4.5,
        numReviews: 98,
        stock: 75,
        image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400',
        ingredients: ['Whole Wheat Flour', 'Honey', 'Olive Oil', 'Yeast'],
        nutritionalInfo: { calories: 80, protein: 4, carbs: 15, fat: 1 },
        preparationTime: '2 hours',
        servings: '16 slices'
    }
];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('🌱 Starting database seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Seed users
        console.log('👥 Seeding users...');
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`   ✅ Created user: ${user.email}`);
        }
        console.log(`✅ ${users.length} users seeded\n`);

        // Seed products
        console.log('🍰 Seeding products...');
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} products seeded\n`);

        console.log('═══════════════════════════════════════════');
        console.log('🎉 Database seeding completed successfully!');
        console.log('═══════════════════════════════════════════');
        console.log('\n📋 Test Accounts:');
        console.log('   Admin: admin@perfectbakery.com / admin123');
        console.log('   Customer: customer@test.com / customer123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run seeder
seedDB();
