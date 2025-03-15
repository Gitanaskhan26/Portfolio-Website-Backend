const Contact = require("../models/Contact");

exports.saveContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const contact = new Contact({ name, email, message });
        await contact.save();
        res.json({ message: "Message received. We will contact you soon." });
    } catch (error) {
        res.status(500).json({ message: "Error submitting message", error });
    }
};
