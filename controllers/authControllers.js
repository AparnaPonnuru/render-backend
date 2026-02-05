const mongoose = require("mongoose");
const User = require("../models/users.model");
require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { generateOTP, sendOTP, sendNotificationMail  } = require("../middlewares/verifySignUp");

const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const OTP = generateOTP();

    const user = new User({
      username,
      email,
      password,
      OTP,
      OTPCreatedTime: new Date(),
      OTPverified: false,
      status: "inactive",
    });

    await user.save();

    // ✅ DO NOT await email
    sendNotificationMail(
      email,
      "Naavi Signup OTP",
      `Your OTP is <b>${OTP}</b>`
    ).catch(err => console.error("Mail failed:", err));

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // ✅ ALWAYS respond immediately
    return res.status(200).json({
      success: true,
      otpSent: true,
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};


    // ✅ send mail AFTER response (non-blocking)
    



const checkEmailDuplicate = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      console.log("User found:", user.email);
      return res.status(400).json({ message: "The email already exists" });
    }

    console.log("No user found, proceeding...");
    return res.status(200).json({ message: "Email is available" });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Something went wrong, signup failed" });
  }
};



// const checkDuplicatedUsername = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (user)
//       return res.status(400).json({ message: "The username already exists" });
    
//       return res.status(200).json({
//         success: true,
//         message: "The username valid",
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Something went wrong , signup fail" });
//   }
// };

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email field
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check email existence
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate OTP and record timestamp
    const OTP = generateOTP();
    const currentTime = new Date();
    userFound.OTP = OTP;
    userFound.OTPCreatedTime = currentTime;
    await userFound.save();

    // Send OTP email
    await sendNotificationMail(
      email,
      "Naavi Password Reset OTP",
      `Dear ${userFound.username},<br>Your OTP for password reset is: <b>${OTP}</b><br>This OTP expires in 10 minutes.`
    );

    // Generate JWT (valid for 24 hours)
    const oneDayInSeconds = 86400;
    const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: oneDayInSeconds,
    });

    console.log("Password reset token generated for user:", userFound.email);

    return res.status(200).json({
      success: true,
      token,
      message: "OTP sent successfully to your email address",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the OTP",
    });
  }
};
const sendConfirmationEmail = async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });
    if (!userFound)
      return res.status(404).json({ message: "User not found" });

    const token = userFound._id;

    const baseUrl = process.env.HOST;
    const url = `${baseUrl}/api/auth/verification/${token}`;

    await sendNotificationMail(
      userFound.email,
      "Naavi Account Confirmation",
      `Dear ${userFound.username || "User"},<br>
       Please confirm your account:<br>
       <a href="${url}">${url}</a>`
    );

    return res.status(200).json({
      success: true,
      message: "Account confirmation email has been sent successfully",
    });
  } catch (error) {
    console.error("sendConfirmationEmail error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// controllers/authControllers.js

const submitForgotPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check OTP validity (10 minutes)
    const OTP_VALIDITY = 10 * 60 * 1000;
    if (new Date() - user.OTPCreatedTime > OTP_VALIDITY) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Check OTP match
    if (user.OTP !== code) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Update password (pre-save hook will hash)
    user.password = newPassword;
    user.OTP = null;
    user.OTPCreatedTime = null;
    user.OTPverified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("submitForgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};





const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if OTP verification is required
    if (!user.OTPverified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email via OTP before logging in",
      });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // Send the response with user data and token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const logout = async (req, res) => {
  try {
    res.clearCookie("delivery-app-session-token");
    return res
      .status(200)
      .json({ success: true, message: "User has logout successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

const sendResetPasswordEmail = async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });

    if (!userFound)
      return res.status(422).json({
        success: false,
        message: "Doesn't exits account link with that email",
      });

    const id = userFound._id;

    const token = jwt.sign(
      {
        id,
        expiration: Date.now() + 10 * 60 * 1000,
      },
      process.env.JWT_SECRET_KEY
    );

    const url = `${
      process.env.HOST || "localhost:3000"
    }/#/authentication/resetPassword/${token}`;

    await sendResetPasswordEmailFunction(url, req.body.email);

    return res.status(200).json({
      success: true,
      message: "Reset password email has been send successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong, fail to to send reset password email",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = decodeURIComponent(req.params.token.trim());
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "Password fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userFound = await User.findById(decoded.id);
    if (!userFound) return res.status(404).json({ message: "User not found" });

    // ✅ LET THE MODEL'S HOOK HANDLE HASHING
userFound.password = newPassword;
await userFound.save();


    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(404).json({ message: "User not found" });

    // Check OTP expiry
    const OTP_VALIDITY_DURATION = 10 * 60 * 1000; // 10 min
    if (new Date() - userFound.OTPCreatedTime > OTP_VALIDITY_DURATION) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    if (otp !== userFound.OTP) {
      return res.status(400).json({ success: false, message: "OTP doesn't match" });
    }

    // Clear and mark OTP verified
    userFound.OTPverified = true;
    userFound.OTP = null;
    userFound.OTPCreatedTime = null;
    await userFound.save();

    return res.status(200).json({ success: true, message: "OTP Verified successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Something went wrong during OTP verification" });
  }
};



const updatePassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP code, and new password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.OTP !== code) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const diff = Date.now() - user.OTPCreatedTime;
    if (diff > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // ✅ Let the model handle hashing
    user.password = newPassword;
    user.OTP = null;
    user.OTPCreatedTime = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const getAllUsers = async (req, res) => {
  console.log("GET /users hit");
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


const getUserProfilePic = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ status: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.profilePicture) {
      return res.status(404).json({ status: false, message: "User profile picture not found" });
    }

    res.json({ status: true, profilePic: user.profilePicture });
  } catch (error) {
    console.error("Error fetching user profile picture:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

const checkUsername = async (req, res) => {
  try {
    // Get username from query string
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ available: false, message: "No username provided" });
    }
    // Find if any user has this username
    const user = await User.findOne({ username });
    if (user) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





module.exports = {
  signUp,
  forgotPassword,
  login,
  checkEmailDuplicate,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  verifyOTP,
  updatePassword,
  getAllUsers,
  getUserProfilePic,
  submitForgotPassword,
  checkUsername // <<---- ADD THIS LINE!
};

