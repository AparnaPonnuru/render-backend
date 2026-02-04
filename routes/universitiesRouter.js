/**************************************************************
 *  UNIVERSITIES API — AUTO-CREATE + AUTO-GENERATE (FIXED)
 **************************************************************/

const express = require("express");
const router = express.Router();
const Universities = require("../models/universities.model");

// If Node < 18 → uncomment:
// const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**************************************************************
 *  1️⃣ FORMATTED LIST
 **************************************************************/
router.get("/formatted/list", async (req, res) => {
  try {
    const { country, limit = 50 } = req.query;

    const query = {};
    if (country) query.country = country;

    const universities = await Universities.find(query)
      .limit(Number(limit))
      .select({
        name: 1,
        country: 1,
        "generatedProgram.program": 1,
        "generatedProgram.description": 1,
        "generatedProgram.grade": 1,
        "generatedProgram.curriculum": 1,
        "generatedProgram.stream": 1,
        "generatedProgram.performance": 1,
        "generatedProgram.financialSituation": 1,
        "generatedProgram.personality": 1,
        "generatedProgram.steps": 1,
      })
      .lean();

    return res.json({
      status: true,
      count: universities.length,
      data: universities,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

/**************************************************************
 *  2️⃣ FIND OR CREATE + GENERATE USING PERPLEXITY
 **************************************************************/
router.get("/find-or-create", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ status: false, error: "University name is required" });
    }

    // 1️⃣ Search DB (case-insensitive)
    let uni = await Universities.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") }
    });

    // 2️⃣ If not found → CREATE NEW ENTRY
    if (!uni) {
      uni = await Universities.create({
        name,
        country: "",
        alpha_two_code: "",
        domains: [],
        web_pages: [],
        generatedProgram: null
      });
    }

    /**************************************************************
     * 🚨 FIX: If generatedProgram is missing OR steps are empty → call AI
     **************************************************************/
    const needsAI =
      !uni.generatedProgram ||
      !uni.generatedProgram.steps ||
      uni.generatedProgram.steps.length === 0;

    if (needsAI) {
      const prompt = `
Generate academic program details for ${uni.name}.
Return STRICT JSON:
{
  "program": "",
  "description": "",
  "grade": "",
  "curriculum": "",
  "stream": "",
  "performance": "",
  "financialSituation": "",
  "personality": "",
  "steps": [
    {"name": "", "description": ""},
    {"name": "", "description": ""},
    {"name": "", "description": ""}
  ]
}
`;

      const aiRes = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const aiJson = await aiRes.json();
      const content = aiJson?.choices?.[0]?.message?.content;

let generated;
try {
  generated = JSON.parse(content);

  // 🔥 AUTO-GENERATE STEP IDs HERE
  generated.steps = generated.steps.map((step, index) => ({
    ...step,
    step_id: `${uni._id}_step_${index}`
  }));

} catch (e) {
  return res.status(500).json({
    status: false,
    error: "AI returned invalid JSON",
    raw: content,
  });
}


      uni.generatedProgram = { ...generated, generatedAt: new Date() };
      await uni.save();
    }

    return res.json({ status: true, data: uni });

  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

/**************************************************************
 *  3️⃣ MANUAL UPDATE
 **************************************************************/
router.post("/updateAI", async (req, res) => {
  try {
    const { id, generatedProgram } = req.body;

    if (!id || !generatedProgram) {
      return res.status(400).json({
        status: false,
        error: "Missing id or generatedProgram",
      });
    }

    const uni = await Universities.findByIdAndUpdate(
      id,
      {
        generatedProgram: {
          ...generatedProgram,
          generatedAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!uni)
      return res.status(404).json({ status: false, error: "University not found" });

    return res.json({ status: true, message: "AI data updated", data: uni });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

/**************************************************************
 *  4️⃣ GET ALL UNIVERSITIES
 **************************************************************/
router.get("/", async (req, res) => {
  try {
    const universities = await Universities.find().lean();
    return res.json({
      status: true,
      count: universities.length,
      data: universities,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

/**************************************************************
 *  5️⃣ GET BY ID
 **************************************************************/
router.get("/:id", async (req, res) => {
  try {
    const uni = await Universities.findById(req.params.id).lean();
    if (!uni)
      return res.status(404).json({ status: false, error: "University not found" });
    return res.json({ status: true, data: uni });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

/**************************************************************
 *  6️⃣ PROGRAM ONLY
 **************************************************************/
router.get("/:id/program", async (req, res) => {
  try {
    const uni = await Universities.findById(req.params.id).lean();
    if (!uni)
      return res.status(404).json({ status: false, error: "University not found" });

    return res.json({
      status: true,
      program: uni.generatedProgram?.program || null,
      description: uni.generatedProgram?.description || null,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
});

/**************************************************************
 *  7️⃣ STEPS ONLY  (THE FIX IS HERE)
 **************************************************************/
router.get("/:id/steps", async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 FIXED — correct model name
    const uni = await Universities.findById(id);

    if (!uni) {
      return res.status(404).json({ success: false, message: "University not found" });
    }

    return res.json({
      success: true,
      school: uni.name,
      description: uni.generatedProgram?.description,
      steps: uni.generatedProgram?.steps || []
    });

  } catch (error) {
    console.error("Error fetching steps:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
