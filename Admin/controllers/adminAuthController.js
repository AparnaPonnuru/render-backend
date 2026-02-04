const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');


// ================= REGISTER (only once) =================
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await AdminUser.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    await AdminUser.create({ email, password });

    res.json({ message: "Admin created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ================= LOGIN =================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminUser.findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await admin.comparePassword(password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const admin = await AdminUser.findOne({ email });

    if (!admin) return res.status(400).json({ message: "Admin not found" });

    admin.password = newPassword; // auto hashed by pre-save
    await admin.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SUPER ADMIN LOGIN =================
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminUser.findOne({
      email: email.trim().toLowerCase(),
      role: "super-admin"   // 🔥 only super admins allowed
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await admin.comparePassword(password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "super-admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  loginSuperAdmin,
  resetPassword
};