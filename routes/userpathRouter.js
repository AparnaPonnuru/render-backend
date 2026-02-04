const express = require("express");
const router = express.Router();

const User = require("../models/users.model");
const Path = require("../models/path.model");
const Step = require("../models/steps.model");


// ------------------------------------------------------
// SELECT A PATH FOR THE USER
// ------------------------------------------------------
router.post("/selectpath", async (req, res) => {
  try {
    const { email, pathId } = req.body;

    if (!email || !pathId) {
      return res.status(400).json({
        status: false,
        message: "email and pathId are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    user.selectedPath = pathId;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Path selected successfully",
      pathId,
    });
  } catch (error) {
    console.error("Select Path Error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});



// ------------------------------------------------------
// GET THE STEPS FOR THE SELECTED PATH
// ------------------------------------------------------
router.get("/steps", async (req, res) => {
  try {
    const { pathId } = req.query;

    if (!pathId) {
      return res.status(400).json({
        status: false,
        message: "pathId is required",
      });
    }

    const path = await Path.findById(pathId).lean();

    if (!path) {
      return res.status(404).json({
        status: false,
        message: "Path not found",
      });
    }

    const stepIds = path.the_ids.map((s) => s.step_id);

    // Fetch full step documents
    const steps = await Step.find({ _id: { $in: stepIds } }).lean();

    return res.status(200).json({
      status: true,
      data: {
        name: path.nameOfPath,
        description: path.description,
        steps,
      },
    });

  } catch (error) {
    console.error("Get Path Steps Error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


// ------------------------------------------------------
// GET USER SELECTED PATH ID
// ------------------------------------------------------
router.get("/selected", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      pathId: user.selectedPath || null,
    });

  } catch (error) {
    console.error("Get Selected Path Error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


// ------------------------------------------------------
// MARK STEP AS COMPLETED
// ------------------------------------------------------
router.put("/completeStep", async (req, res) => {
  try {
    const { email, pathId, step_id } = req.body;

    if (!email || !pathId || !step_id) {
      return res.status(400).json({
        status: false,
        message: "email, pathId, and step_id are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    user.completedSteps = user.completedSteps || [];
    if (!user.completedSteps.includes(step_id)) {
      user.completedSteps.push(step_id);
    }

    await user.save();

    res.status(200).json({
      status: true,
      message: "Step marked as completed",
    });

  } catch (error) {
    console.error("Complete Step Error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


// ------------------------------------------------------
// MARK STEP AS FAILED
// ------------------------------------------------------
router.put("/failedStep", async (req, res) => {
  try {
    const { email, pathId, step_id } = req.body;

    if (!email || !pathId || !step_id) {
      return res.status(400).json({
        status: false,
        message: "email, pathId, and step_id are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    user.failedSteps = user.failedSteps || [];
    if (!user.failedSteps.includes(step_id)) {
      user.failedSteps.push(step_id);
    }

    await user.save();

    res.status(200).json({
      status: true,
      message: "Step marked as failed",
    });

  } catch (error) {
    console.error("Failed Step Error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


module.exports = router;
