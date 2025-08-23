/**
 * Blog Routes
 * 
 * Defines API endpoints for blog post management.
 * Handles CRUD operations for blog content with authentication and advanced features.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const express = require("express");
const { 
    getBlogs, 
    getBlog, 
    addBlog, 
    updateBlog, 
    deleteBlog, 
    getBlogStats 
} = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");

// Create router instance
const router = express.Router();

/**
 * @route   GET /api/blogs
 * @desc    Get all blog posts with filtering, search, and pagination
 * @access  Public
 * @query   {string} status - Filter by status (published, draft, archived)
 * @query   {string} tag - Filter by tag
 * @query   {string} search - Search in title and content
 * @query   {string} sort - Sort order (newest, oldest, title, views)
 * @query   {number} limit - Number of blogs per page (default: 10)
 * @query   {number} page - Page number for pagination (default: 1)
 * @returns {object} Array of blogs with pagination info and popular tags
 * 
 * @example
 * GET /api/blogs
 * GET /api/blogs?status=published&sort=newest&limit=5
 * GET /api/blogs?search=nodejs&tag=programming
 */
router.get("/", getBlogs);

/**
 * @route   GET /api/blogs/stats
 * @desc    Get blog statistics (total, published, drafts, views, etc.)
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @returns {object} Blog statistics
 * 
 * @example
 * GET /api/blogs/stats
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get("/stats", authMiddleware, getBlogStats);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get single blog post by ID (increments view count)
 * @access  Public
 * @params  {string} id - Blog MongoDB ObjectId
 * @returns {object} Single blog post data
 * 
 * @example
 * GET /api/blogs/64abc123def456789
 */
router.get("/:id", getBlog);

/**
 * @route   POST /api/blogs
 * @desc    Create new blog post
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @body    {string} title - Blog post title (required)
 * @body    {string} content - Blog post content (required)
 * @body    {string} excerpt - Short description/summary (optional)
 * @body    {string[]} tags - Array of tags for categorization (optional)
 * @body    {string} status - Publication status (draft, published, archived)
 * @returns {object} Created blog post data
 * 
 * @example
 * POST /api/blogs
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "title": "Getting Started with Node.js",
 *   "content": "Node.js is a powerful runtime environment...",
 *   "excerpt": "Learn the basics of Node.js development",
 *   "tags": ["nodejs", "javascript", "backend", "programming"],
 *   "status": "published"
 * }
 */
router.post("/", authMiddleware, addBlog);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update existing blog post
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Blog MongoDB ObjectId
 * @body    {object} updateData - Fields to update
 * @returns {object} Updated blog post data
 * 
 * @example
 * PUT /api/blogs/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "title": "Updated Blog Title",
 *   "content": "Updated content...",
 *   "tags": ["nodejs", "javascript", "tutorial"],
 *   "status": "published"
 * }
 */
router.put("/:id", authMiddleware, updateBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete blog post by ID
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Blog MongoDB ObjectId
 * @returns {object} Success message with deleted blog info
 * 
 * @example
 * DELETE /api/blogs/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.delete("/:id", authMiddleware, deleteBlog);

/**
 * Route Protection Summary:
 * - GET /blogs: Public access (shows only published blogs)
 * - GET /blogs/:id: Public access (increments view count)
 * - GET /blogs/stats: Private access (admin statistics)
 * - POST, PUT, DELETE: Private access (JWT token required)
 * 
 * Features:
 * - Content filtering by status and tags
 * - Full-text search in title and content
 * - Automatic view counting
 * - SEO-friendly slug generation
 * - Reading time calculation
 * - Popular tags aggregation
 * - Comprehensive pagination
 */

module.exports = router;
