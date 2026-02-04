const router = require("express").Router();
const University = require("../models/universities.model");

// GET all programs for one university
router.get("/:universityId/programs", async (req, res) => {
  try {
    const uni = await University.findById(req.params.universityId);

    if (!uni)
      return res.status(404).json({ status: false, message: "University not found" });

    res.json({ status: true, programs: uni.generatedProgram || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
