module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ message: "Access denied" });

    try {
        const splitToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const verified = jwt.verify(splitToken, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch {
        res.status(403).json({ message: "Invalid token" });
    }
};
