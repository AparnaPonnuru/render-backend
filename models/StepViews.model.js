const mongoose = require("mongoose");

const StepViewsSchema = new mongoose.Schema({
  pathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Path",
    required: true,
  },
  stepId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "career_steps",
    required: true,
  },

  macroView: {
    description: { type: String, default: "" },
  },

  microView: {
    description: { type: String, default: "" },
  },

  nanoView: {
    description: { type: String, default: "" }, // 🔥 FIX
  },

  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("StepViews", StepViewsSchema);
