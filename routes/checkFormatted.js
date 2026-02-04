const express = require("express");
const router = express.Router();
const Universities = require("../models/universities.model");

// GET /api/universities/formatted?country=United States&limit=100
router.get("/universities/formatted", async (req, res) => {
  try {
    const { country, limit = 100 } = req.query;

    const filter = {};

    if (country) filter.country = country;

    const data = await Universities.find(filter)
      .limit(parseInt(limit))
      .select({
        name: 1,
        country: 1,
        generatedProgram: 1,
      });

    const formatted = data.map((u) => ({
      name: u.name,
      country: u.country,
      program: u.generatedProgram?.program || null,
      grade: u.generatedProgram?.grade || null,
      curriculum: u.generatedProgram?.curriculum || null,
      stream: u.generatedProgram?.stream || null,
      performance: u.generatedProgram?.performance || null,
      financialSituation: u.generatedProgram?.financialSituation || null,
      personality: u.generatedProgram?.personality || null,
      steps: u.generatedProgram?.steps || [],
    }));

    res.json({
      total: formatted.length,
      formatted,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server failed." });
  }
});

module.exports = router;
