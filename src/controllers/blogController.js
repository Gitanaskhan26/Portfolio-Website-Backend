/**
 * Blog Controller
 * 
 * Handles CRUD operations for blog posts.
 * Manages blog creation, retrieval, updates, and deletion with advanced features.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const Blog = require("../models/Blog");

/**
 * Get All Blogs Controller
 * 
 * Retrieves all blog posts with filtering, sorting, and pagination options.
 * Public endpoint accessible without authentication.
 * 
 * @async
 * @function getBlogs
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.status - Filter by status (published, draft, archived)
 * @param {string} req.query.tag - Filter by tag
 * @param {string} req.query.search - Search in title and content
 * @param {string} req.query.sort - Sort by (newest, oldest, title, views)
 * @param {number} req.query.limit - Limit number of results
 * @param {number} req.query.page - Page number for pagination
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with blogs array and pagination info
 * 
 * @example
 * // GET /api/blogs
 * // GET /api/blogs?status=published&sort=newest&limit=10
 * // GET /api/blogs?search=nodejs&tag=programming
 */
exports.getBlogs = async (req, res) => {
    try {
        const { 
            status = 'published', 
            tag, 
            search, 
            sort = 'newest', 
            limit = 10, 
            page = 1 
        } = req.query;

        // Build filter object
        const filter = { status };
        
        if (tag) {
            filter.tags = { $in: [tag.toLowerCase()] };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'oldest':
                sortObj = { publishedAt: 1 };
                break;
            case 'title':
                sortObj = { title: 1 };
                break;
            case 'views':
                sortObj = { views: -1 };
                break;
            case 'newest':
            default:
                sortObj = { publishedAt: -1 };
                break;
        }

        // Calculate pagination
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const skip = (pageNum - 1) * limitNum;

        // Get blogs with pagination
        const blogs = await Blog.find(filter)
            .sort(sortObj)
            .limit(limitNum)
            .skip(skip)
            .select('-content') // Exclude full content for list view
            .lean();

        // Get total count for pagination
        const totalBlogs = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / limitNum);

        // Get popular tags
        const popularTags = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        console.log(`✅ Retrieved ${blogs.length} blogs`);

        res.json({
            success: true,
            data: blogs,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalBlogs,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            popularTags: popularTags.map(tag => ({
                name: tag._id,
                count: tag.count
            }))
        });

    } catch (error) {
        console.error("❌ Error fetching blogs:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Single Blog Controller
 * 
 * Retrieves a single blog post by ID and increments view count.
 * Public endpoint accessible without authentication.
 * 
 * @async
 * @function getBlog
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Blog ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with blog data
 */
exports.getBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID format"
            });
        }

        // Find blog and increment view count
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Only show published blogs to public (unless admin request)
        if (blog.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        console.log(`✅ Blog retrieved: ${blog.title} (Views: ${blog.views})`);

        res.json({
            success: true,
            data: blog
        });

    } catch (error) {
        console.error("❌ Error fetching blog:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Add New Blog Controller
 * 
 * Creates a new blog post in the database.
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function addBlog
 * @param {Object} req - Express request object
 * @param {Object} req.body - Blog data
 * @param {string} req.body.title - Blog title
 * @param {string} req.body.content - Blog content
 * @param {string} req.body.excerpt - Optional blog excerpt
 * @param {string[]} req.body.tags - Optional tags array
 * @param {string} req.body.status - Blog status (draft, published, archived)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message and created blog
 * 
 * @example
 * // POST /api/blogs (with Authorization header)
 * {
 *   "title": "Getting Started with Node.js",
 *   "content": "Node.js is a powerful runtime...",
 *   "excerpt": "Learn the basics of Node.js",
 *   "tags": ["nodejs", "javascript", "backend"],
 *   "status": "published"
 * }
 */
exports.addBlog = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            excerpt, 
            tags, 
            status = 'published' 
        } = req.body;

        // Input validation
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // Process tags - ensure they're lowercase and trimmed
        const processedTags = tags ? tags.map(tag => tag.toLowerCase().trim()) : [];

        // Create new blog post
        const blog = new Blog({
            title: title.trim(),
            content: content.trim(),
            excerpt: excerpt?.trim(),
            tags: processedTags,
            status,
            author: 'gitanaskhan26' // Set author from token if available
        });

        const savedBlog = await blog.save();

        console.log(`✅ New blog created: ${savedBlog.title}`);

        res.status(201).json({
            success: true,
            message: "Blog added successfully",
            data: savedBlog
        });

    } catch (error) {
        console.error("❌ Error adding blog:", error);

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
            message: "Error adding blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update Blog Controller
 * 
 * Updates an existing blog post by ID.
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function updateBlog
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Blog ID to update
 * @param {Object} req.body - Updated blog data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message and updated blog
 */
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.views; // Don't allow manual view count updates

        // Process tags if provided
        if (updateData.tags) {
            updateData.tags = updateData.tags.map(tag => tag.toLowerCase().trim());
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        console.log(`✅ Blog updated: ${updatedBlog.title}`);

        res.json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog
        });

    } catch (error) {
        console.error("❌ Error updating blog:", error);

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
            message: "Error updating blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete Blog Controller
 * 
 * Deletes a blog post by ID from the database.
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function deleteBlog
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Blog ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message
 * 
 * @example
 * // DELETE /api/blogs/64abc123def456789
 */
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID format"
            });
        }

        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        console.log(`✅ Blog deleted: ${deletedBlog.title}`);

        res.json({
            success: true,
            message: "Blog deleted successfully",
            data: {
                id: deletedBlog._id,
                title: deletedBlog.title
            }
        });

    } catch (error) {
        console.error("❌ Error deleting blog:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Blog Statistics Controller
 * 
 * Returns statistics about blog posts (admin only).
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function getBlogStats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with blog statistics
 */
exports.getBlogStats = async (req, res) => {
    try {
        const stats = await Blog.aggregate([
            {
                $group: {
                    _id: null,
                    totalBlogs: { $sum: 1 },
                    publishedBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draftBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    averageReadTime: { $avg: '$readTime' }
                }
            }
        ]);

        const result = stats[0] || {
            totalBlogs: 0,
            publishedBlogs: 0,
            draftBlogs: 0,
            totalViews: 0,
            averageReadTime: 0
        };

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("❌ Error fetching blog stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching blog statistics",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
