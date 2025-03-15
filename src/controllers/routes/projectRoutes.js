const express = require("express");
const { getProjects, addProject, deleteProject } = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProjects);
router.post("/", authMiddleware, addProject);
router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;
