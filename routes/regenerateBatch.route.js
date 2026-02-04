// routes/regenerateBatch.route.js
const express = require("express");
const router = express.Router();
const Universities = require("../models/universities.model");
const axios = require("axios");

// 🟦 How many universities per batch?
const BATCH_SIZE = 25;

// 🟩 Regenerate a batch of universities
router.post("/batch", async (req, res) => {
  try {
    let { skip = 0, limit = BATCH_SIZE } = req.body;

    skip = parseInt(skip);
    limit = parseInt(limit);

    console.log(`🔁 Regenerating batch: skip=${skip}, limit=${limit}`);

    // Fetch universities
    const universities = await Universities.find()
      .skip(skip)
      .limit(limit);

    if (universities.length === 0) {
      return res.json({
        success: true,
        finished: true,
        message: "All universities processed!",
      });
    }

    const results = [];

    for (const uni of universities) {
      console.log(`🔥 Regenerating for: ${uni.name}`);

      try {
        const aiRes = await axios.post(
          "https://api.perplexity.ai/chat/completions",
          {
            model: "sonar",
            messages: [
              {
                role: "system",
                content:
                  "You generate realistic university academic programs. Respond only in valid JSON.",
              },
              {
                role: "user",
                content: `Generate an academic program for: ${uni.name}.
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

        // Clean & parse JSON
        let raw = aiRes?.data?.choices?.[0]?.message?.content || "";
        raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonData = JSON.parse(raw);

        // Save updated program
        uni.generatedProgram = {
          ...jsonData,
          generatedAt: new Date(),
        };

        await uni.save();

        results.push({
          university: uni.name,
          status: "updated",
        });

      } catch (err) {
        console.log("❌ Error for:", uni.name, err.message);

        results.push({
          university: uni.name,
          status: "failed",
          error: err.message,
        });
      }
    }

    return res.json({
      success: true,
      finished: false,
      nextSkip: skip + limit,
      batchSize: universities.length,
      results,
    });

  } catch (err) {
    console.log("❌ Batch Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
