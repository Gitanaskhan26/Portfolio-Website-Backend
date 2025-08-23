/**
 * Project Routes
 * 
 * Defines API endpoints for portfolio project management.
 * Handles CRUD operations for project data with proper authentication.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const express = require("express");
const { 
    getProjects, 
    getProject, 
    addProject, 
    updateProject, 
    deleteProject 
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

// Create router instance
const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects with optional filtering and pagination
 * @access  Public
 * @query   {string} category - Filter by project category
 * @query   {string} sort - Sort order (newest, oldest, title)
 * @query   {number} limit - Number of projects per page (default: 50)
 * @query   {number} page - Page number for pagination (default: 1)
 * @returns {object} Array of projects with pagination info
 * 
 * @example
 * GET /api/projects
 * GET /api/projects?category=Web Development&sort=newest&limit=10&page=1
 */
router.get("/", getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Public
 * @params  {string} id - Project MongoDB ObjectId
 * @returns {object} Single project data
 * 
 * @example
 * GET /api/projects/64abc123def456789
 */
router.get("/:id", getProject);

/**
 * @route   POST /api/projects
 * @desc    Add new project
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @body    {string} title - Project title (required)
 * @body    {string} category - Project category (required)
 * @body    {string} image - Project image URL (required)
 * @body    {string} description - Project description (optional)
 * @body    {string[]} technologies - Technologies used (optional)
 * @body    {string} projectUrl - Live project URL (optional)
 * @body    {string} githubUrl - GitHub repository URL (optional)
 * @returns {object} Created project data
 * 
 * @example
 * POST /api/projects
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "title": "Portfolio Website",
 *   "category": "Web Development",
 *   "image": "https://example.com/image.jpg",
 *   "description": "My personal portfolio website",
 *   "technologies": ["React", "Node.js", "MongoDB"],
 *   "projectUrl": "https://portfolio.example.com",
 *   "githubUrl": "https://github.com/user/portfolio"
 * }
 */
router.post("/", authMiddleware, addProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update existing project
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Project MongoDB ObjectId
 * @body    {object} updateData - Fields to update
 * @returns {object} Updated project data
 * 
 * @example
 * PUT /api/projects/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "title": "Updated Project Title",
 *   "description": "Updated description"
 * }
 */
router.put("/:id", authMiddleware, updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project by ID
 * @access  Private (Admin only - requires JWT token)
 * @headers Authorization: Bearer <token>
 * @params  {string} id - Project MongoDB ObjectId
 * @returns {object} Success message with deleted project info
 * 
 * @example
 * DELETE /api/projects/64abc123def456789
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.delete("/:id", authMiddleware, deleteProject);

/**
 * Route Protection Summary:
 * - GET routes: Public access (no authentication required)
 * - POST, PUT, DELETE routes: Private access (JWT token required)
 * 
 * All protected routes use the authMiddleware to validate JWT tokens
 * and ensure only authenticated admin users can modify project data.
 */

module.exports = router;
