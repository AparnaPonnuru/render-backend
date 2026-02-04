/**************************************************************
 *  RESUME SCRIPT — ONLY UPDATES UNIVERSITIES WHICH ARE MISSING DATA
 **************************************************************/

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/universities.model");
const { ObjectId } = require("mongodb");

const API_KEY = process.env.PERPLEXITY_API_KEY;

const BATCH_SIZE = 5;
const WAIT = (ms) => new Promise((res) => setTimeout(res, ms));

/**************************************************************
 *  PROMPT BUILDER
 **************************************************************/
function buildPrompt(universities) {
  return `
Return STRICT JSON ARRAY ONLY.

Each object must follow EXACTLY:

{
  "id": "",
  "school": "",
  "program": "",
  "description": "",
  "grade": "",
  "curriculum": "",
  "stream": "",
  "performance": "",
  "financialSituation": "",
  "personality": "",
  "country": "",
  "steps": [
    { "name": "", "description": "" },
    { "name": "", "description": "" },
    { "name": "", "description": "" }
  ]
}

Universities:
${JSON.stringify(universities)}
`;
}

/**************************************************************
 *  PERPLEXITY REQUEST
 **************************************************************/
async function generateBatch(universitiesBatch) {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        temperature: 0.1,
        messages: [
          { role: "system", content: "Return ONLY PURE JSON. No markdown." },
          { role: "user", content: buildPrompt(universitiesBatch) }
        ],
      }),
    });

    const rawText = await response.text();

    if (rawText.startsWith("<")) {
      throw new Error("HTML returned → rate limit or error");
    }

    const json = JSON.parse(rawText);
    const content = json.choices?.[0]?.message?.content;

    return JSON.parse(content);

  } catch (error) {
    console.error("❌ Perplexity Batch Error:", error.message);
    return null;
  }
}

/**************************************************************
 *  MAIN (RESUME)
 **************************************************************/
(async () => {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("Connected to MongoDB");

  // 🔥 Only pick universities that DO NOT have generatedProgram
  const pending = await Universities.find(
    { generatedProgram: { $exists: false } }
  ).lean();

  console.log("Pending universities:", pending.length);

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    console.log(`\nProcessing batch ${i / BATCH_SIZE + 1}...`);

    const batch = pending.slice(i, i + BATCH_SIZE).map((u) => ({
      id: u._id,
      school: u.name,
      country: u.country || "",
      program: u.program || "",
      description: u.description || ""
    }));

    const generated = await generateBatch(batch);

    if (!generated) {
      console.log("⚠️ Retry in 5 seconds...");
      await WAIT(5000);
      i -= BATCH_SIZE;
      continue;
    }

    for (const item of generated) {
      if (!item.id) continue;

      const steps = item.steps.map((s) => ({
        _id: new ObjectId(),
        name: s.name,
        description: s.description,
      }));

      await Universities.updateOne(
        { _id: item.id },
        {
          $set: {
            generatedProgram: {
              program: item.program,
              description: item.description,
              grade: item.grade,
              curriculum: item.curriculum,
              stream: item.stream,
              performance: item.performance,
              financialSituation: item.financialSituation,
              personality: item.personality,
              country: item.country,
              steps,
              generatedAt: new Date(),
            },
          },
        }
      );
    }

    console.log("⏳ Waiting 5 seconds...");
    await WAIT(5000);
  }

  console.log("🎉 Resume update completed!");
  process.exit(0);
})();
