const mongoose = require("mongoose");

const UserPathSelectionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  steps: [
    {
      stepId: mongoose.Schema.Types.ObjectId,
      name: String,
      description: String,
    },
  ],
}, { timestamps:true });

module.exports = mongoose.model("UserPathSelection", UserPathSelectionSchema);
