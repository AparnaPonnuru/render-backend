const router = require("express").Router();
const University = require("../models/universities.model");

// GET steps for program
router.get("/:programId/steps", async (req, res) => {
  try {
    const programId = req.params.programId;

    const university = await University.findOne({
      "generatedProgram._id": programId,
    });

    if (!university)
      return res.status(404).json({ status: false, message: "Program not found" });

    const foundProgram = university.generatedProgram.find(
      (p) => p._id.toString() === programId
    );

    res.json({ status: true, steps: foundProgram.steps || [] });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
