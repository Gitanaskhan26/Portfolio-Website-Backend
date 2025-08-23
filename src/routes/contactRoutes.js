/**
 * Contact Routes
 * 
 * Defines API endpoints for contact form management.
 * Handles contact message submissions and admin contact management features.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const express = require("express");
const { 
    saveContact, 
    getContacts, 
    getContact, 
    updateContactStatus, 
    deleteContact, 
    getContactStats 
} = require("../controllers/contactController");
const authMiddleware = require("../middleware/authMiddleware");

// Create router instance
const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit contact form message
 * @access  Public
 * @body    {string} name - Contact person's full name (required)
 * @body    {string} email - Contact email address (required)
 * @body    {string} phone - Phone number (optional)
 * @body    {string} subject - Message subject (optional)
 * @body    {string} message - Contact message content (required)
 * @returns {object} Success message and submission confirmation
 * 
 * @example
 * POST /api/contact
 * Content-Type: application/json
 * 
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+1234567890",
 *   "subject": "Project Inquiry",
 *   "message": "I'm interested in your web development services..."
 * }
 */
router.post("/", saveContact);

/**
 * @route   GET /api/contact
 * @desc    Get all contact messages with filtering and pagination (Admin only)
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @query   {string} status - Filter by status (new, read, replied, archived)
 * @query   {string} priority - Filter by priority (low, normal, high, urgent)
 * @query   {string} sort - Sort order (newest, oldest, name, email)
 * @query   {number} limit - Number of contacts per page (default: 20)
 * @query   {number} page - Page number for pagination (default: 1)
 * @returns {object} Array of contact messages with pagination info
 * 
 * @example
 * GET /api/contact
 * GET /api/contact?status=new&sort=newest&limit=10
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get("/", authMiddleware, getContacts);

/**
 * @route   GET /api/contact/stats
 * @desc    Get contact message statistics (Admin only)
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @returns {object} Contact statistics (total, by status, recent count)
 * 
 * @example
 * GET /api/contact/stats
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get("/stats", authMiddleware, getContactStats);

/**
 * @route   GET /api/contact/:id
 * @desc    Get single contact message by ID (Admin only)
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Contact message MongoDB ObjectId
 * @returns {object} Single contact message data
 * 
 * @example
 * GET /api/contact/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get("/:id", authMiddleware, getContact);

/**
 * @route   PUT /api/contact/:id
 * @desc    Update contact message status and add admin notes
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Contact message MongoDB ObjectId
 * @body    {string} status - New status (new, read, replied, archived)
 * @body    {string} priority - New priority (low, normal, high, urgent)
 * @body    {string} notes - Admin notes about the contact
 * @returns {object} Updated contact message data
 * 
 * @example
 * PUT /api/contact/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "status": "replied",
 *   "priority": "normal",
 *   "notes": "Responded via email with project details"
 * }
 */
router.put("/:id", authMiddleware, updateContactStatus);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete contact message by ID (Admin only)
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Contact message MongoDB ObjectId
 * @returns {object} Success message with deleted contact info
 * 
 * @example
 * DELETE /api/contact/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.delete("/:id", authMiddleware, deleteContact);

/**
 * Route Protection Summary:
 * - POST /contact: Public access (contact form submission)
 * - GET, PUT, DELETE routes: Private access (admin management)
 * 
 * Features:
 * - Public contact form submission with validation
 * - Admin dashboard for managing contact messages
 * - Status tracking (new, read, replied, archived)
 * - Priority levels for contact triage
 * - Admin notes system for internal tracking
 * - Comprehensive filtering and pagination
 * - Statistics and analytics for contact management
 * - Automatic timestamp tracking
 * - IP address and user agent logging (for security)
 * 
 * Security Features:
 * - Input validation and sanitization
 * - Email format validation
 * - Rate limiting recommended for production
 * - Sensitive data protection in responses
 */

module.exports = router;
