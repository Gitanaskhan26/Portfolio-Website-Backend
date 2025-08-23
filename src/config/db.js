/**
 * Database Configuration Module
 * 
 * Handles MongoDB connection using Mongoose ODM.
 * Configures connection options and error handling.
 * 
 * @author gitanaskhan26
 * @version 1.0.0
 * @since 2025-08-23
 */

const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Establishes connection to MongoDB database
 * 
 * Uses connection string from MONGO_URI environment variable.
 * Implements proper error handling and connection options.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} Exits process on connection failure
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,    // Use new URL parser
            useUnifiedTopology: true  // Use new topology engine
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Exit process with failure code
    }
};

module.exports = connectDB;
