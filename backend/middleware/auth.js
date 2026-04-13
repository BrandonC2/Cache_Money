const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const raw =
      decoded.userId ??
      decoded.id ??
      decoded.sub ??
      (decoded.user && decoded.user.id);
    const userId = raw != null ? String(raw) : null;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
