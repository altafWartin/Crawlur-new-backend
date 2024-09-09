const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Only required for Admin and Analyst
    role: {
        type: String,
        enum: ['Admin', 'Analyst', 'User'],
        default: 'User'
    },
}, {
    timestamps: true
});

// Hash password before saving if it's an Admin or Analyst
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (this.role === 'Admin' || this.role === 'Analyst') {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
