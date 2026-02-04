const express = require("express");
const router = express.Router();

const Step = require("../models/steps.model");
const StepViews = require("../models/StepViews.model");

router.get("/", async (req, res) => {
  try {
    const { stepId, pathId } = req.query;

    if (!stepId || !pathId) {
      return res.status(400).json({
        success: false,
        message: "stepId and pathId are required",
      });
    }

    // 1️⃣ Fetch step
    const step = await Step.findById(stepId);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Step not found",
      });
    }

    // 2️⃣ MACRO VIEW (string → object)
    const macroDescription =
      step.macro_description?.trim() ||
      step.description ||
      "";

    // 3️⃣ MICRO VIEW (string)
    const microDescription =
      step.micro_description?.trim() || "";

    // 4️⃣ NANO VIEW (STRING — 🔥 FIX)
    const nanoDescription =
      step.nano_description?.trim() || "";

    // 5️⃣ Payload EXACTLY matches StepViews schema
    const payload = {
      stepId,
      pathId,
      macroView: {
        description: macroDescription,
      },
      microView: {
        description: microDescription,
      },
      nanoView: {
        description: nanoDescription,
      },
    };

    // 6️⃣ Find existing StepView
    let view = await StepViews.findOne({ stepId, pathId });

    if (view) {
      view.macroView = payload.macroView;
      view.microView = payload.microView;
      view.nanoView = payload.nanoView;

      await view.save();
      return res.json({ success: true, data: view });
    }

    // 7️⃣ Create new StepView
    const created = await StepViews.create(payload);
    return res.json({ success: true, data: created });

  } catch (err) {
    console.error("STEPVIEWS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
