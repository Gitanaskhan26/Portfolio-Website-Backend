/**
 * Project Controller
 * 
 * Handles CRUD operations for portfolio projects.
 * Manages project creation, retrieval, updates, and deletion.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const Project = require("../models/Project");

/**
 * Get All Projects Controller
 * 
 * Retrieves all projects from the database with optional filtering and sorting.
 * Public endpoint accessible without authentication.
 * 
 * @async
 * @function getProjects
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {string} req.query.category - Optional category filter
 * @param {string} req.query.sort - Optional sort parameter (newest, oldest, title)
 * @param {number} req.query.limit - Optional limit for pagination
 * @param {number} req.query.page - Optional page number for pagination
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with projects array
 * 
 * @example
 * // GET /api/projects
 * // GET /api/projects?category=Web Development
 * // GET /api/projects?sort=newest&limit=10&page=1
 */
exports.getProjects = async (req, res) => {
    try {
        const { category, sort = 'newest', limit = 50, page = 1 } = req.query;
        
        // Build filter object
        const filter = {};
        if (category) {
            filter.category = category;
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'oldest':
                sortObj = { createdAt: 1 };
                break;
            case 'title':
                sortObj = { title: 1 };
                break;
            case 'newest':
            default:
                sortObj = { createdAt: -1 };
                break;
        }

        // Calculate pagination
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const skip = (pageNum - 1) * limitNum;

        // Get projects with pagination
        const projects = await Project.find(filter)
            .sort(sortObj)
            .limit(limitNum)
            .skip(skip)
            .lean(); // Use lean() for better performance

        // Get total count for pagination info
        const totalProjects = await Project.countDocuments(filter);
        const totalPages = Math.ceil(totalProjects / limitNum);

        console.log(`✅ Retrieved ${projects.length} projects`);

        res.json({
            success: true,
            data: projects,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProjects,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error("❌ Error fetching projects:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching projects", 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Add New Project Controller
 * 
 * Creates a new project entry in the database.
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function addProject
 * @param {Object} req - Express request object
 * @param {Object} req.body - Project data
 * @param {string} req.body.title - Project title
 * @param {string} req.body.category - Project category
 * @param {string} req.body.image - Project image URL
 * @param {string} req.body.description - Optional project description
 * @param {string[]} req.body.technologies - Optional technologies used
 * @param {string} req.body.projectUrl - Optional live project URL
 * @param {string} req.body.githubUrl - Optional GitHub repository URL
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message and created project
 * 
 * @example
 * // POST /api/projects (with Authorization header)
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
exports.addProject = async (req, res) => {
    try {
        const { 
            title, 
            category, 
            image, 
            description, 
            technologies, 
            projectUrl, 
            githubUrl 
        } = req.body;

        // Input validation
        if (!title || !category || !image) {
            return res.status(400).json({
                success: false,
                message: "Title, category, and image are required fields"
            });
        }

        // Create new project
        const project = new Project({
            title: title.trim(),
            category,
            image,
            description: description?.trim() || '',
            technologies: technologies || [],
            projectUrl: projectUrl?.trim() || '',
            githubUrl: githubUrl?.trim() || ''
        });

        const savedProject = await project.save();

        console.log(`✅ New project created: ${savedProject.title}`);

        res.status(201).json({
            success: true,
            message: "Project added successfully",
            data: savedProject
        });

    } catch (error) {
        console.error("❌ Error adding project:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Error adding project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update Project Controller
 * 
 * Updates an existing project by ID.
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function updateProject
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Project ID to update
 * @param {Object} req.body - Updated project data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message and updated project
 */
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        );

        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        console.log(`✅ Project updated: ${updatedProject.title}`);

        res.json({
            success: true,
            message: "Project updated successfully",
            data: updatedProject
        });

    } catch (error) {
        console.error("❌ Error updating project:", error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete Project Controller
 * 
 * Deletes a project by ID from the database.
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function deleteProject
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Project ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message
 * 
 * @example
 * // DELETE /api/projects/64abc123def456789
 */
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        console.log(`✅ Project deleted: ${deletedProject.title}`);

        res.json({
            success: true,
            message: "Project deleted successfully",
            data: {
                id: deletedProject._id,
                title: deletedProject.title
            }
        });

    } catch (error) {
        console.error("❌ Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Single Project Controller
 * 
 * Retrieves a single project by ID.
 * Public endpoint accessible without authentication.
 * 
 * @async
 * @function getProject
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Project ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with project data
 */
exports.getProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        console.log(`✅ Project retrieved: ${project.title}`);

        res.json({
            success: true,
            data: project
        });

    } catch (error) {
        console.error("❌ Error fetching project:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
