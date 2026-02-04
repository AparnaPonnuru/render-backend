const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (isPasswordValid) {
      res.status(200).json({ message: "Login successful" }); // Proceed with your session or token logic
    } else {
      res.status(400).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { login };
