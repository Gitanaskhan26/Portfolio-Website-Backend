/**
 * Portfolio Website Backend API
 * 
 * A RESTful API service for managing portfolio projects, blog posts,
 * contact messages, and admin authentication.
 * 
 * @author Gitanaskhan26
 * @version 1.0.0
 */

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

// Load environment variables from .env file
require("dotenv").config();

// Initialize database connection
connectDB();

// Create Express application instance
const app = express();

// Middleware Configuration
app.use(express.json()); // Parse JSON request bodies
app.use(cors());         // Enable Cross-Origin Resource Sharing

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));       // Authentication endpoints
app.use("/api/projects", require("./routes/projectRoutes")); // Project management endpoints
app.use("/api/blogs", require("./routes/blogRoutes"));       // Blog management endpoints
app.use("/api/contact", require("./routes/contactRoutes"));  // Contact form endpoints

// Root endpoint - API status check
app.get("/", (req, res) => {
  res.send("🚀 Portfolio Backend is Live!");
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// 404 handler for undefined routes
app.get("*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
