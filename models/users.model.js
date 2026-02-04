// models/users.model.js
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String },
  name: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  postalCode: { type: String },
  profilePicture: { type: String },

  // Visible username the user typed
  username: { type: String, trim: true },

  // NEW: canonical field for uniqueness (lowercased)
  usernameLower: { type: String, unique: true, sparse: true },

  password: { type: String, required: true },
  userType: { type: String },
  phoneNumber: { type: String },
  financialSituation: { type: String },
  school: { type: String },
  performance: { type: String },
  curriculum: { type: String },
  stream: { type: String },
  grade: { type: String },
  OTP: { type: String },
  OTPCreatedTime: { type: Date },
  OTPAttempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  OTPverified: { type: Boolean, default: false },
  blockUntil: { type: Date },
  linkedin: { type: String },
  user_level: { type: Number, default: 0 },
  profileComplete: { type: Boolean, default: false },
  personality: { type: String, enum: ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'], default: 'realistic' },
  status: { type: String, enum: ['active', 'inactive', 'false'], default: 'active' },
}, { timestamps: true });

// Normalize username fields before save
userSchema.pre("save", async function (next) {
  // normalize username
  if (this.isModified("username") && this.username) {
    this.username = this.username.trim();
    this.usernameLower = this.username.toLowerCase();
  }

  // hash password if modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('naavi_users', userSchema);
