const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfect_bakery';
        
        const conn = await mongoose.connect(mongoURI, {
            // These options are no longer needed in Mongoose 6+, but included for compatibility
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('');
        console.log('📋 SETUP INSTRUCTIONS:');
        console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.log('   OR use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
        console.log('');
        console.log('2. Update your .env file with the connection string:');
        console.log('   For local: MONGODB_URI=mongodb://localhost:27017/perfect_bakery');
        console.log('   For Atlas: MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/perfect_bakery');
        console.log('');
        process.exit(1);
    }
};

module.exports = connectDB;
