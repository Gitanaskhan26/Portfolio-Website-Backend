/**
 * Authentication Middleware
 * 
 * JWT-based authentication middleware for protecting routes.
 * Validates JWT tokens and extracts user information.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const jwt = require("jsonwebtoken");

/**
 * Middleware function to authenticate JWT tokens
 * 
 * Validates the Authorization header and verifies JWT token.
 * Extracts user information and attaches to request object.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
module.exports = (req, res, next) => {
    // Extract token from Authorization header
    const token = req.header("Authorization");
    
    // Check if token exists
    if (!token) {
        return res.status(403).json({ 
            message: "Access denied - No token provided" 
        });
    }

    try {
        // Handle Bearer token format or plain token
        const splitToken = token.startsWith("Bearer ") 
            ? token.split(" ")[1] 
            : token;
        
        // Verify token with JWT secret
        const verified = jwt.verify(splitToken, process.env.JWT_SECRET);
        
        // Attach user data to request object
        req.user = verified;
        
        // Continue to next middleware/route handler
        next();
    } catch (error) {
        // Token is invalid
        res.status(403).json({ 
            message: "Invalid token - Authentication failed" 
        });
    }
};
