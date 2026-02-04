const express = require("express");
const router = express.Router();
const axios = require("axios");
const Universities = require("../models/universities.model");
const mongoose = require("mongoose");

/**
 * =====================================================
 *   🔥 AI PROGRAM GENERATION USING PERPLEXITY
 * =====================================================
 */
router.post("/generate", async (req, res) => {
  try {
    const { name, id } = req.body;

    if (!name || !id) {
      return res.status(400).json({
        status: false,
        error: "University name and ID are required",
      });
    }

    console.log(`🔥 Generating AI Program for: ${name}`);

    // ---------------------------
    // 1️⃣ CALL PERPLEXITY API
    // ---------------------------
    const aiRes = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You generate realistic university academic programs. Respond ONLY in valid JSON. No text outside JSON.",
          },
          {
            role: "user",
            content: `Generate the most suitable undergraduate program for: ${name}.
Return ONLY JSON:
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
    { "name": "", "description": "" }
  ]
}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ---------------------------
    // 2️⃣ Extract AI response
    // ---------------------------
    let raw = aiRes?.data?.choices?.[0]?.message?.content;

    if (!raw) {
      return res.status(500).json({
        status: false,
        error: "Perplexity returned empty content",
      });
    }

    // ---------------------------
    // 3️⃣ CLEAN THE JSON
    // ---------------------------
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\u0000-\u001F]+/g, "")
      .trim();

    let generatedJson;

    try {
      generatedJson = JSON.parse(raw);
    } catch (err) {
      console.log("❌ AI returned invalid JSON:", raw);

      return res.status(500).json({
        status: false,
        error: "AI returned invalid JSON even after cleaning",
        raw,
      });
    }

    // -------------------------------------------------------
    // 4️⃣ ADD UNIQUE ID TO EACH STEP (IMPORTANT FIX)
    // -------------------------------------------------------
    if (Array.isArray(generatedJson.steps)) {
      generatedJson.steps = generatedJson.steps.map((step) => ({
        ...step,
        id: new mongoose.Types.ObjectId().toString(),
      }));
    }
    // -------------------------------------------------------

    // ---------------------------
    // 5️⃣ UPDATE MONGODB
    // ---------------------------
    const updated = await Universities.findByIdAndUpdate(
      id,
      {
        generatedProgram: {
          ...generatedJson,
          generatedAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: false,
        error: "University not found in database",
      });
    }

    console.log("✅ AI program saved for:", updated.name);

    return res.json({
      status: true,
      generatedProgram: updated.generatedProgram,
    });
  } catch (err) {
    console.log("❌ Perplexity API Error:", err.response?.data || err.message);

    return res.status(500).json({
      status: false,
      error: err.response?.data || err.message,
    });
  }
});

module.exports = router;
