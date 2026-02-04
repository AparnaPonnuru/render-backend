// controllers/user.controller.js
const User = require("../models/users.model");

exports.checkUsername = async (req, res) => {
  try {
    const raw = (req.query.username || "").trim();
    if (!raw) return res.status(400).json({ available: false, message: "No username provided" });

    const unameLower = raw.toLowerCase();
    const exists = await User.findOne({ usernameLower: unameLower }).lean();

    return res.json({ available: !exists });
  } catch (err) {
    console.error("checkUsername error:", err);
    return res.status(500).json({ available: false, error: "Server error" });
  }
};
