const express = require("express");
const { saveContact } = require("../controllers/contactController");

const router = express.Router();

router.post("/", saveContact);

module.exports = router;
