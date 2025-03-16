const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log("🔍 Received email:", email);
    console.log("🔍 Received password:", password);

    try {
        const admin = await User.findOne({ email });
        if (!admin) {
            console.log("❌ User not found in DB");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ User found:", admin);
        console.log("🔍 Stored hashed password:", admin.password);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log("❌ Password does not match");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ Login successful, token generated");
        res.json({ token });

    } catch (error) {
        console.log("❌ Server error:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};
