/**
 * Project Model
 * 
 * Defines the Project schema for portfolio project management.
 * Stores project information including title, category, and image.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const mongoose = require("mongoose");

/**
 * Project Schema Definition
 * 
 * Defines the structure for portfolio projects with validation rules.
 * Used for displaying and managing portfolio items.
 * 
 * @typedef {Object} Project
 * @property {string} title - Project name/title
 * @property {string} category - Project category (e.g., "Web Development", "Mobile App")
 * @property {string} image - URL to project image/screenshot
 * @property {Date} createdAt - Automatic creation timestamp
 * @property {Date} updatedAt - Automatic update timestamp
 */
const ProjectSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Project title cannot exceed 100 characters']
    },
    category: { 
        type: String, 
        required: [true, 'Project category is required'],
        trim: true,
        enum: {
            values: [
                'Web Development', 
                'Mobile Development', 
                'Desktop Application', 
                'Data Analysis', 
                'Machine Learning', 
                'UI/UX Design',
                'Other'
            ],
            message: 'Invalid project category'
        }
    },
    image: { 
        type: String, 
        required: [true, 'Project image URL is required'],
        validate: {
            validator: function(v) {
                // Basic URL validation
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: 'Please provide a valid image URL'
        }
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    technologies: [{
        type: String,
        trim: true
    }],
    projectUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid project URL'
        }
    },
    githubUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/github\.com\/.+/.test(v);
            },
            message: 'Please provide a valid GitHub URL'
        }
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Index for better query performance
 */
ProjectSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Project", ProjectSchema);
