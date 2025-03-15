const Blog = require("../models/Blog");

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.addBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const blog = new Blog({ title, content });
        await blog.save();
        res.json({ message: "Blog added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding blog", error });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting blog", error });
    }
};
