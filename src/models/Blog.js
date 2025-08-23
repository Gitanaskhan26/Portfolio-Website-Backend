/**
 * Blog Model
 * 
 * Defines the Blog schema for blog post management.
 * Stores blog content with automatic timestamps and validation.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const mongoose = require("mongoose");

/**
 * Blog Schema Definition
 * 
 * Defines the structure for blog posts with content management capabilities.
 * Includes automatic timestamps and content validation.
 * 
 * @typedef {Object} Blog
 * @property {string} title - Blog post title
 * @property {string} content - Blog post content (supports HTML/Markdown)
 * @property {string} excerpt - Short description/summary of the blog post
 * @property {string[]} tags - Array of tags for categorization
 * @property {string} status - Publication status (draft, published, archived)
 * @property {string} author - Author of the blog post
 * @property {Date} createdAt - Automatic creation timestamp
 * @property {Date} updatedAt - Automatic update timestamp
 * @property {Date} publishedAt - Publication timestamp
 */
const BlogSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Blog title cannot exceed 200 characters']
    },
    content: { 
        type: String, 
        required: [true, 'Blog content is required'],
        minlength: [10, 'Blog content must be at least 10 characters long']
    },
    excerpt: {
        type: String,
        maxlength: [300, 'Excerpt cannot exceed 300 characters'],
        default: function() {
            // Auto-generate excerpt from content if not provided
            return this.content.substring(0, 150) + '...';
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: {
            values: ['draft', 'published', 'archived'],
            message: 'Status must be either draft, published, or archived'
        },
        default: 'published'
    },
    author: {
        type: String,
        default: 'gitanaskhan26',
        trim: true
    },
    readTime: {
        type: Number, // Reading time in minutes
        default: function() {
            // Calculate reading time (average 200 words per minute)
            const wordCount = this.content.split(' ').length;
            return Math.ceil(wordCount / 200);
        }
    },
    views: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date,
        default: function() {
            return this.status === 'published' ? new Date() : null;
        }
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Indexes for better query performance
 */
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ title: 'text', content: 'text' }); // Text search index

/**
 * Virtual for URL slug
 */
BlogSchema.virtual('slug').get(function() {
    return this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').trim('-');
});

/**
 * Pre-save middleware to update publishedAt when status changes to published
 */
BlogSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model("Blog", BlogSchema);
