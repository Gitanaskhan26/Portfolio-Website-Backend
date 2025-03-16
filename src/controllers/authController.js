const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const admin = await User.findOne({ email });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
