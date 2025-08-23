/**
 * Authentication Controller
 * 
 * Handles user authentication, login, and JWT token management.
 * Provides secure authentication endpoints for admin access.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Admin Login Controller
 * 
 * Authenticates admin users and generates JWT tokens for secure access.
 * Validates credentials and returns authentication token on success.
 * 
 * @async
 * @function adminLogin
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.email - Admin email address
 * @param {string} req.body.password - Admin password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with token or error message
 * 
 * @example
 * // POST /api/auth/login
 * {
 *   "email": "admin@example.com",
 *   "password": "securepassword"
 * }
 * 
 * // Success Response
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIs...",
 *   "user": {
 *     "id": "userId",
 *     "username": "admin"
 *   }
 * }
 */
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
        return res.status(400).json({ 
            message: "Email and password are required" 
        });
    }
    
    console.log("🔍 Login attempt for email:", email);
    console.log("🔍 Password provided:", password ? "Yes" : "No");

    try {
        // Find admin user by email (or username for backward compatibility)
        const admin = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: email.toLowerCase() }
            ]
        });
        
        if (!admin) {
            console.log("❌ User not found in database");
            return res.status(401).json({ 
                message: "Invalid credentials - User not found" 
            });
        }

        console.log("✅ User found:", admin.username);
        console.log("🔍 Stored hashed password:", admin.password);

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log("❌ Password does not match");
            return res.status(401).json({ 
                message: "Invalid credentials - Incorrect password" 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username,
                role: admin.role || 'admin' // Default role if not set
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: "24h", // Extended to 24 hours for better UX
                issuer: "portfolio-backend",
                audience: "portfolio-admin"
            }
        );

        console.log("✅ Login successful, token generated");
        
        // Return token and user info (excluding password)
        res.json({ 
            message: "Login successful",
            token,
            user: {
                id: admin._id,
                username: admin.username,
                role: admin.role || 'admin'
            }
        });

    } catch (error) {
        console.error("❌ Server error during login:", error);
        res.status(500).json({ 
            message: "Internal server error during authentication", 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Register Admin Controller (Optional - for initial setup)
 * 
 * Creates a new admin user account. Should be used only for initial setup
 * or by existing admins to create additional admin accounts.
 * 
 * @async
 * @function registerAdmin
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing registration data
 * @param {string} req.body.username - Admin username
 * @param {string} req.body.email - Admin email address
 * @param {string} req.body.password - Admin password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success or error message
 */
exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Username, email, and password are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long"
        });
    }

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() }
            ]
        });

        if (existingAdmin) {
            return res.status(409).json({
                message: "Admin with this username or email already exists"
            });
        }

        // Create new admin user
        const admin = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password, // Will be hashed by the pre-save middleware
            role: 'admin'
        });

        await admin.save();

        console.log("✅ New admin created:", username);

        res.status(201).json({
            message: "Admin account created successfully",
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });

    } catch (error) {
        console.error("❌ Error creating admin:", error);
        res.status(500).json({
            message: "Error creating admin account",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Verify Token Controller
 * 
 * Verifies the validity of a JWT token and returns user information.
 * Useful for checking authentication status on the frontend.
 * 
 * @async
 * @function verifyToken
 * @param {Object} req - Express request object (with user data from middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with user data or error
 */
exports.verifyToken = async (req, res) => {
    try {
        // User data is attached by authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Token is valid",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || 'admin'
            }
        });

    } catch (error) {
        console.error("❌ Error verifying token:", error);
        res.status(500).json({
            message: "Error verifying token",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
