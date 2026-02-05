// =========================================
//  📧 SENDGRID + AUTH CONTROLLER (FINAL)
// =========================================

const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");


// =========================================
// SENDGRID CONFIG
// =========================================

// ✅ Validate ENV first (prevents silent failures)
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY missing in environment");
}

if (!process.env.EMAIL_SERVICE_USER) {
  console.error("❌ EMAIL_SERVICE_USER missing in environment");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userEmail = process.env.EMAIL_SERVICE_USER;

console.log(
  "📧 SendGrid Config:",
  process.env.SENDGRID_API_KEY ? "Key Loaded ✅" : "Key Missing ❌"
);


// =========================================
// OTP GENERATOR
// =========================================
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);
  return otp;
};


// =========================================
// SEND MAIL USING SENDGRID
// =========================================
const sendNotificationMail = async (email, subject, message) => {
  try {
    const msg = {
      to: email,
      from: userEmail, // must be verified sender
      subject: subject || "Notification",
      html: `<p>${message}</p>`,
    };

    const response = await sgMail.send(msg);

    // ✅ VERY IMPORTANT → SendGrid returns 202 if success
    console.log("✅ SendGrid Status:", response[0].statusCode);

    return true;

  } catch (error) {
    console.error("❌ SendGrid FULL Error:", error);
    return false;
  }
};


// =========================================
// SIGNUP FUNCTION
// =========================================
const saltRounds = 10;

const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // =========================
    // Validate fields
    // =========================
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // =========================
    // Check duplicate
    // =========================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // =========================
    // Create user
    // =========================
    const OTP = generateOTP();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const temporalUser = new User({
      username,
      email,
      password: hashedPassword,
      OTP,
      OTPCreatedTime: new Date(),
      OTPverified: false,
      status: false,
    });

    await temporalUser.save();

    // =========================
    // Send OTP Email
    // =========================
    const mailSent = await sendNotificationMail(
      email,
      "Naavi Registration OTP",
      `Dear User,<br>Your OTP is: <b>${OTP}</b>`
    );

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Email sending failed. Please try again.",
      });
    }

    // =========================
    // Generate JWT
    // =========================
    const token = jwt.sign(
      { id: temporalUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent.",
      token,
      user: {
        id: temporalUser._id,
        username: temporalUser.username,
        email: temporalUser.email,
      },
    });

  } catch (error) {
    console.error("❌ SignUp Error:", error);

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};


// =========================================
// VERIFY OTP
// =========================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (otp !== userFound.OTP) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const otpAge = Date.now() - new Date(userFound.OTPCreatedTime).getTime();

    if (otpAge > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    userFound.OTPverified = true;
    userFound.status = true;

    await userFound.save();

    return res.status(200).json({
      success: true,
      message: "OTP Verified successfully",
    });

  } catch (err) {
    console.error("❌ Verify OTP Error:", err);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};


// =========================================
module.exports = {
  signUp,
  verifyOTP,
  generateOTP,
  sendNotificationMail,
};
