/**
 * Contact Model
 * 
 * Defines the Contact schema for contact form submissions.
 * Stores visitor inquiries and contact information with validation.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const mongoose = require("mongoose");

/**
 * Contact Schema Definition
 * 
 * Defines the structure for contact form submissions with validation rules.
 * Used for storing and managing visitor inquiries and messages.
 * 
 * @typedef {Object} Contact
 * @property {string} name - Contact person's full name
 * @property {string} email - Contact email address
 * @property {string} phone - Optional phone number
 * @property {string} subject - Optional subject line
 * @property {string} message - Contact message content
 * @property {string} status - Message status (new, read, replied, archived)
 * @property {string} source - Source of the contact (website, referral, etc.)
 * @property {Date} createdAt - Automatic creation timestamp
 * @property {Date} updatedAt - Automatic update timestamp
 * @property {Date} respondedAt - Timestamp when responded to
 */
const ContactSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                // Email validation regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                // Optional phone validation - only validate if provided
                return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
            },
            message: 'Please provide a valid phone number'
        }
    },
    subject: {
        type: String,
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: { 
        type: String, 
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['new', 'read', 'replied', 'archived'],
            message: 'Status must be new, read, replied, or archived'
        },
        default: 'new'
    },
    source: {
        type: String,
        default: 'website',
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    respondedAt: {
        type: Date
    },
    respondedBy: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Indexes for better query performance
 */
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ createdAt: -1 });

/**
 * Virtual for full contact info
 */
ContactSchema.virtual('fullContactInfo').get(function() {
    return {
        name: this.name,
        email: this.email,
        phone: this.phone || 'Not provided'
    };
});

/**
 * Pre-save middleware to set respondedAt when status changes to replied
 */
ContactSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'replied' && !this.respondedAt) {
        this.respondedAt = new Date();
    }
    next();
});

/**
 * Static method to get unread message count
 */
ContactSchema.statics.getUnreadCount = function() {
    return this.countDocuments({ status: 'new' });
};

/**
 * Instance method to mark as read
 */
ContactSchema.methods.markAsRead = function() {
    this.status = 'read';
    return this.save();
};

module.exports = mongoose.model("Contact", ContactSchema);
