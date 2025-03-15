const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
connectDB();  // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
