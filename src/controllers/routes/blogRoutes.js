const express = require("express");
const { getBlogs, addBlog, deleteBlog } = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getBlogs);
router.post("/", authMiddleware, addBlog);
router.delete("/:id", authMiddleware, deleteBlog);

module.exports = router;
