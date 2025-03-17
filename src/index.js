const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// ✅ Default Route for Root URL (Fixes "Cannot GET /" Error)
app.get("/", (req, res) => {
  res.send("🚀 Portfolio Backend is Live!");
});

// ✅ Optional: Serve Static Files (If Frontend Needs It)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Handle Unknown Routes Gracefully
app.get("*", (req, res) => {
  res.status(404).json({ message: "🔍 API route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
