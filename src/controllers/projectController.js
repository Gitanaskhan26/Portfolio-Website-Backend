const Project = require("../models/Project");

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.addProject = async (req, res) => {
    try {
        const { title, category, image } = req.body;
        const project = new Project({ title, category, image });
        await project.save();
        res.json({ message: "Project added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding project", error });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting project", error });
    }
};
