/**************************************************************
 *  OPTIMIZED PERPLEXITY SCRIPT — FAST, STABLE, LESS TOKENS
 **************************************************************/

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/universities.model");
const { ObjectId } = require("mongodb");

const API_KEY = process.env.PERPLEXITY_API_KEY;

const BATCH_SIZE = 5;  
const WAIT = (ms) => new Promise((r) => setTimeout(r, ms));

/**************************************************************
 *  CLEAN JSON PROMPT (tiny = fewer tokens!)
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
  "grade": "Grade 10 / Grade 11 / Grade 12",
  "curriculum": "IB / CBSE / IGCSE / ICSE / Nordic",
  "stream": "MPC / BIPC / Commerce / Humanities / Engineering / Science / Arts",
  "performance": "0-25% / 25-75% / 76-85% / 86-95% / 96-100%",
  "financialSituation": "0-25 Lakhs / 25-75 Lakhs / 75 Lakhs-3CR / 3CR+ / Other",
  "personality": "realistic / investigative / artistic / social / enterprising / conventional",
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
 *  PERPLEXITY BATCH GENERATOR
 **************************************************************/
async function generateBatch(input) {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",     // best for structured JSON
        temperature: 0.1,       // keeps JSON clean
        messages: [
          { role: "system", content: "Respond ONLY with pure JSON. No text." },
          { role: "user", content: buildPrompt(input) }
        ]
      })
    });

    const raw = await res.text();

    // HTML means: rate-limit or gateway error
    if (raw.startsWith("<")) {
      throw new Error("Perplexity returned HTML (rate limit or failure)");
    }

    const data = JSON.parse(raw);

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty Perplexity response");

    return JSON.parse(content);

  } catch (err) {
    console.log("❌ Perplexity Batch Error:", err.message);
    return null;
  }
}

/**************************************************************
 *  MAIN EXECUTION
 **************************************************************/
(async () => {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("Connected to MongoDB");

  const all = await Universities.find().lean();
  console.log("Total universities:", all.length);

  for (let i = 0; i < all.length; i += BATCH_SIZE) {
    console.log(`\nProcessing batch ${i / BATCH_SIZE + 1}...`);

    const batch = all.slice(i, i + BATCH_SIZE).map((u) => ({
      id: u._id,
      school: u.name,
      country: u.country || "",
      program: u.generatedProgram?.program || "",
      description: u.generatedProgram?.description || ""
    }));

    const result = await generateBatch(batch);

    if (!result) {
      console.log("⚠️ Retry in 5 seconds...");
      await WAIT(5000);
      i -= BATCH_SIZE; // retry same batch
      continue;
    }

    for (const uni of result) {
      if (!uni.id) continue;

      const steps = uni.steps.map((s) => ({
        _id: new ObjectId(),
        name: s.name,
        description: s.description
      }));

      await Universities.updateOne(
        { _id: uni.id },
        {
          $set: {
            generatedProgram: {
              program: uni.program,
              description: uni.description,
              grade: uni.grade,
              curriculum: uni.curriculum,
              stream: uni.stream,
              performance: uni.performance,
              financialSituation: uni.financialSituation,
              personality: uni.personality,
              country: uni.country,
              steps,
              generatedAt: new Date()
            }
          }
        }
      );
    }

    console.log("⏳ Waiting 5 seconds...");
    await WAIT(5000);
  }

  console.log("🎉 FINISHED!");
  process.exit(0);
})();
