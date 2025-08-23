/**
 * Contact Controller
 * 
 * Handles contact form submissions and contact management.
 * Manages contact message storage, retrieval, and status updates.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const Contact = require("../models/Contact");

/**
 * Save Contact Message Controller
 * 
 * Processes and saves contact form submissions to the database.
 * Public endpoint accessible without authentication.
 * 
 * @async
 * @function saveContact
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contact form data
 * @param {string} req.body.name - Contact person's name
 * @param {string} req.body.email - Contact email address
 * @param {string} req.body.phone - Optional phone number
 * @param {string} req.body.subject - Optional subject line
 * @param {string} req.body.message - Contact message content
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message
 * 
 * @example
 * // POST /api/contact
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+1234567890",
 *   "subject": "Project Inquiry",
 *   "message": "I'm interested in your web development services..."
 * }
 */
exports.saveContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Input validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required fields"
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Extract client information
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');

        // Create new contact message
        const contact = new Contact({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone?.trim(),
            subject: subject?.trim(),
            message: message.trim(),
            ipAddress,
            userAgent,
            source: 'website'
        });

        const savedContact = await contact.save();

        console.log(`✅ New contact message from: ${savedContact.name} (${savedContact.email})`);

        // Send confirmation response
        res.status(201).json({
            success: true,
            message: "Thank you for your message! We will get back to you soon.",
            data: {
                id: savedContact._id,
                name: savedContact.name,
                email: savedContact.email,
                submittedAt: savedContact.createdAt
            }
        });

        // TODO: Add email notification to admin
        // sendNewContactNotification(savedContact);

    } catch (error) {
        console.error("❌ Error saving contact message:", error);

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
            message: "Sorry, there was an error submitting your message. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get All Contact Messages Controller
 * 
 * Retrieves all contact messages with filtering and pagination (Admin only).
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function getContacts
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.status - Filter by status (new, read, replied, archived)
 * @param {string} req.query.priority - Filter by priority (low, normal, high, urgent)
 * @param {string} req.query.sort - Sort by (newest, oldest, name, email)
 * @param {number} req.query.limit - Limit number of results
 * @param {number} req.query.page - Page number for pagination
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with contacts array and pagination info
 */
exports.getContacts = async (req, res) => {
    try {
        const { 
            status, 
            priority, 
            sort = 'newest', 
            limit = 20, 
            page = 1 
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'oldest':
                sortObj = { createdAt: 1 };
                break;
            case 'name':
                sortObj = { name: 1 };
                break;
            case 'email':
                sortObj = { email: 1 };
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

        // Get contacts with pagination
        const contacts = await Contact.find(filter)
            .sort(sortObj)
            .limit(limitNum)
            .skip(skip)
            .select('-ipAddress -userAgent') // Exclude sensitive data
            .lean();

        // Get total count for pagination
        const totalContacts = await Contact.countDocuments(filter);
        const totalPages = Math.ceil(totalContacts / limitNum);

        // Get unread count
        const unreadCount = await Contact.getUnreadCount();

        console.log(`✅ Retrieved ${contacts.length} contact messages`);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalContacts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            stats: {
                unreadCount
            }
        });

    } catch (error) {
        console.error("❌ Error fetching contacts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching contact messages",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Single Contact Message Controller
 * 
 * Retrieves a single contact message by ID (Admin only).
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function getContact
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Contact message ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with contact data
 */
exports.getContact = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID format"
            });
        }

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found"
            });
        }

        // Mark as read if it's new
        if (contact.status === 'new') {
            await contact.markAsRead();
        }

        console.log(`✅ Contact message retrieved: ${contact.name}`);

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error("❌ Error fetching contact:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching contact message",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update Contact Status Controller
 * 
 * Updates the status of a contact message (Admin only).
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function updateContactStatus
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Contact message ID
 * @param {Object} req.body - Update data
 * @param {string} req.body.status - New status (new, read, replied, archived)
 * @param {string} req.body.priority - New priority (low, normal, high, urgent)
 * @param {string} req.body.notes - Admin notes
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with updated contact
 */
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, notes } = req.body;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID format"
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (notes !== undefined) updateData.notes = notes;

        // Set respondedAt and respondedBy if status is 'replied'
        if (status === 'replied') {
            updateData.respondedAt = new Date();
            updateData.respondedBy = req.user?.username || 'admin';
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedContact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found"
            });
        }

        console.log(`✅ Contact status updated: ${updatedContact.name} -> ${updatedContact.status}`);

        res.json({
            success: true,
            message: "Contact status updated successfully",
            data: updatedContact
        });

    } catch (error) {
        console.error("❌ Error updating contact status:", error);

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
            message: "Error updating contact status",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete Contact Message Controller
 * 
 * Deletes a contact message by ID (Admin only).
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function deleteContact
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Contact message ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message
 */
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID format"
            });
        }

        const deletedContact = await Contact.findByIdAndDelete(id);

        if (!deletedContact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found"
            });
        }

        console.log(`✅ Contact message deleted: ${deletedContact.name} (${deletedContact.email})`);

        res.json({
            success: true,
            message: "Contact message deleted successfully",
            data: {
                id: deletedContact._id,
                name: deletedContact.name,
                email: deletedContact.email
            }
        });

    } catch (error) {
        console.error("❌ Error deleting contact:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting contact message",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Contact Statistics Controller
 * 
 * Returns statistics about contact messages (Admin only).
 * Requires admin authentication via JWT token.
 * 
 * @async
 * @function getContactStats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with contact statistics
 */
exports.getContactStats = async (req, res) => {
    try {
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: null,
                    totalContacts: { $sum: 1 },
                    newContacts: {
                        $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
                    },
                    readContacts: {
                        $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
                    },
                    repliedContacts: {
                        $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
                    },
                    archivedContacts: {
                        $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get recent contacts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentContacts = await Contact.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const result = stats[0] || {
            totalContacts: 0,
            newContacts: 0,
            readContacts: 0,
            repliedContacts: 0,
            archivedContacts: 0
        };

        result.recentContacts = recentContacts;

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("❌ Error fetching contact stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching contact statistics",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
