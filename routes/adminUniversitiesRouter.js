const router = require("express").Router();
const Universities = require("../models/universities.model");

/*************************************************************
 * 1️⃣ GET ALL UNIVERSITIES WITH PAGINATION
 *************************************************************/
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Universities.countDocuments();

    const universities = await Universities.find({})
      .skip(skip)
      .limit(limit)
      .select("name country generatedProgram.program generatedProgram.steps");

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: universities
    });
  } catch (err) {
    console.error("Error fetching universities:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*************************************************************
 * 2️⃣ GET A SINGLE UNIVERSITY'S STEPS
 *************************************************************/
router.get("/:id/steps", async (req, res) => {
  try {
    const uni = await Universities.findById(req.params.id);

    if (!uni) return res.status(404).json({ success: false, message: "University not found" });

    res.json({
      success: true,
      university: uni.name,
      program: uni.generatedProgram?.program,
      steps: uni.generatedProgram?.steps || []
    });
  } catch (err) {
    console.error("Error fetching steps:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
