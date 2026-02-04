const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/users.model");
const jwt = require("jsonwebtoken");

// ===============================
// EMAIL CONFIG
// ===============================
const userEmail = process.env.EMAIL_SERVICE_USER;
const userAppPassword = process.env.EMAIL_SERVICE_PASS;

const gx_transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: userEmail,
    pass: userAppPassword,
  },
});

// ===============================
// OTP GENERATOR
// ===============================
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // ✅ 6-digit numeric OTP
  console.log("Generated OTP:", otp);
  return otp;
};

// ===============================
// SEND OTP EMAIL
// ===============================
const sendOTP = (email, OTP) => {
  const mailOptions = {
    from: userEmail,
    to: email,
    subject: "Your OTP for Naavi",
    text: `Your OTP is: ${OTP}`,
    html: `<p>Your OTP is: <b>${OTP}</b></p>`,
  };

  gx_transport.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Failed to send OTP:", error);
    else console.log("OTP email sent:", info.response);
  });
};

// ===============================
// SEND GENERIC NOTIFICATION MAIL
// ===============================
const sendNotificationMail = (email, subject, message) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: userEmail,
      to: email,
      subject: subject || "User Registration Confirmation",
      html: `<p>${message}</p>`,
    };

    gx_transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Failed to send notification email:", error);
        reject({ success: false, message: "Failed to send email" });
      } else {
        console.log("Notification email sent:", info.response);
        resolve({ success: true, message: "Notification email sent successfully" });
      }
    });
  });
};

// ===============================
// SIGNUP FUNCTION
// ===============================
const bcrypt = require("bcrypt");
const saltRounds = 10;

const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log("Received signUp request:", { email, username, password });

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (email, username, password) are required",
      });
    }

    // ✅ Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered with this email",
      });
    }

    // ✅ Generate OTP and hash password
    const OTP = generateOTP();
    const currentTime = new Date();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ✅ Create new user
    const temporalUser = new User({
      username,
      email,
      password: hashedPassword, // store hashed password
      OTP,
      isBlocked: false,
      OTPAttempts: 0,
      OTPCreatedTime: currentTime,
      OTPverified: false,
      status: false,
    });

    await temporalUser.save();

    // ✅ Send OTP email
    console.log("Sending OTP email...");
    await sendNotificationMail(
      email,
      "Naavi Registration Confirmation OTP",
      `Dear User,<br>Your OTP is: <b>${OTP}</b><br>`
    );

    // ✅ Generate JWT
    const token = jwt.sign({ id: temporalUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent to your email.",
      token,
      user: {
        id: temporalUser._id,
        username: temporalUser.username,
        email: temporalUser.email,
      },
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during signup",
    });
  }
};


// ===============================
// VERIFY OTP FUNCTION
// ===============================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Received verifyOTP request:", { email, otp });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (otp !== userFound.OTP) {
      console.log("OTP mismatch");
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }
    const otpAge = Date.now() - new Date(userFound.OTPCreatedTime).getTime();
    if (otpAge > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }


    userFound.OTPverified = true;
    userFound.status = true; // ✅ optionally mark as active
    await userFound.save();

    return res.status(200).json({
      success: true,
      message: "OTP Verified successfully",
    });
  } catch (err) {
    console.log("Error during OTP verification:", err);
    return res.status(500).json({
      success: false, // ✅ Fixed key
      message: "Something went wrong during OTP verification",
    });
  }
};

// ===============================
module.exports = {
  signUp,
  verifyOTP,
  sendOTP,
  generateOTP,
  sendNotificationMail,
};
