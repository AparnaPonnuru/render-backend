const express = require("express");
const router = express.Router();
const Universities = require("../models/universities.model");
const mongoose = require("mongoose");

router.post("/add-step-ids", async (req, res) => {
  try {
    const universities = await Universities.find({});
    let updatedCount = 0;

    for (const uni of universities) {
      if (!uni.generatedProgram?.steps) continue;

      let modified = false;

      uni.generatedProgram.steps = uni.generatedProgram.steps.map(step => {
        if (!step._id) {
          step._id = new mongoose.Types.ObjectId();
          modified = true;
        }
        return step;
      });

      if (modified) {
        await uni.save();
        updatedCount++;
      }
    }

    return res.json({
      success: true,
      updated: updatedCount,
      message: "Step IDs added successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
