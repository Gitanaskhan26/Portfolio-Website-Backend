/**
 * Authentication Routes
 * 
 * Defines API endpoints for user authentication and authorization.
 * Handles login, registration, and token verification routes.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const express = require("express");
const { adminLogin, registerAdmin, verifyToken } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Create router instance
const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin user and get JWT token
 * @access  Public
 * @body    {string} email - Admin email address
 * @body    {string} password - Admin password
 * @returns {object} JWT token and user information
 * 
 * @example
 * POST /api/auth/login
 * Content-Type: application/json
 * 
 * {
 *   "email": "admin@example.com",
 *   "password": "securepassword"
 * }
 */
router.post("/login", adminLogin);

/**
 * @route   POST /api/auth/register
 * @desc    Register new admin user (for initial setup)
 * @access  Public (should be restricted in production)
 * @body    {string} username - Admin username
 * @body    {string} email - Admin email address
 * @body    {string} password - Admin password
 * @returns {object} Success message and user information
 * 
 * @example
 * POST /api/auth/register
 * Content-Type: application/json
 * 
 * {
 *   "username": "admin",
 *   "email": "admin@example.com",
 *   "password": "securepassword"
 * }
 * 
 * @note In production, this route should be disabled or protected
 */
router.post("/register", registerAdmin);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and get user information
 * @access  Private (requires valid JWT token)
 * @headers Authorization: Bearer <token>
 * @returns {object} User information if token is valid
 * 
 * @example
 * GET /api/auth/verify
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get("/verify", authMiddleware, verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private (requires valid JWT token)
 * @returns {object} Success message
 * 
 * @note Since JWT tokens are stateless, logout is handled client-side
 *       by removing the token from storage. This endpoint is for consistency.
 */
router.post("/logout", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

module.exports = router;
