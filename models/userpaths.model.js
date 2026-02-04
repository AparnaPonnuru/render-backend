// models/userpaths.model.js
const mongoose = require("mongoose");

const userPathSchema = new mongoose.Schema(
  {
    email: { type: String },                           // <- used everywhere
    pathId: { type: mongoose.Types.ObjectId },         // current selected path
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    completedSteps: [{ type: mongoose.Types.ObjectId }],
    currentStep: { type: String }                      // step_id or "completed"
  },
  { timestamps: true }
);

module.exports = mongoose.model("userPaths", userPathSchema);
