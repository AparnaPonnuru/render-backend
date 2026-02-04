const express = require("express");
const router = express.Router();
const Universities = require("../models/universities.model");
const axios = require("axios");

// 🔥 Regenerate full university program using Perplexity
router.post("/regenerate-all", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "University ID is required",
      });
    }

    const uni = await Universities.findById(id);
    if (!uni) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    console.log("🔥 Regenerating program for:", uni.name);

    const aiRes = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You generate realistic university academic programs. Respond ONLY in valid JSON.",
          },
          {
            role: "user",
            content: `Generate an updated program for: ${uni.name}.
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

    // Clean JSON
    let text = aiRes?.data?.choices?.[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let generatedJson = JSON.parse(text);

    // Save to MongoDB
    uni.generatedProgram = {
      ...generatedJson,
      generatedAt: new Date(),
    };
    await uni.save();

    return res.json({
      success: true,
      message: "Regenerated successfully",
      data: uni.generatedProgram,
    });
  } catch (error) {
    console.error("❌ Error regenerating:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
