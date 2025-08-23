/**
 * User Model
 * 
 * Defines the User/Admin schema for authentication.
 * Includes password hashing and validation.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema Definition
 * 
 * Defines the structure for user/admin accounts with authentication capabilities.
 * Includes automatic password hashing on save operations.
 * 
 * @typedef {Object} User
 * @property {string} username - Unique username for authentication
 * @property {string} password - Hashed password for security
 */
const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Pre-save middleware for password hashing
 * 
 * Automatically hashes the password before saving to database.
 * Only runs when password is new or modified to avoid unnecessary hashing.
 * 
 * @param {Function} next - Mongoose next middleware function
 */
UserSchema.pre("save", async function (next) {
    // Only hash password if it has been modified (or is new)
    if (!this.isModified("password")) return next();
    
    try {
        // Hash password with salt rounds of 10
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method to compare passwords
 * 
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
