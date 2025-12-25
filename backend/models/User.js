const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
        type: String,
        default: '',
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        default: '',
        trim: true
    },
    password: {
        type: String,
        default: null,
        minlength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
        type: String,
        default: '👤'
    },
    profilePicture: {
        type: String,
        default: null
    },
    oauth: {
        google: { type: String, default: null },
        facebook: { type: String, default: null }
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' }
    },
    rewards: {
        type: Number,
        default: 100 // Welcome bonus points
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Return user without password
userSchema.methods.toPublicJSON = function() {
    const user = this.toObject();
    delete user.password;
    user.id = user._id.toString();
    return user;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by OAuth ID
userSchema.statics.findByOAuthId = function(provider, oauthId) {
    const query = {};
    query[`oauth.${provider}`] = oauthId;
    return this.findOne(query);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
