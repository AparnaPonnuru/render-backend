/**************************************************************
 *  STEPS-ONLY SCRIPT — FAST + CHEAP + SAFE
 *  Updates ONLY: generatedProgram.steps
 **************************************************************/

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/universities.model");
const { ObjectId } = require("mongodb");

const API_KEY = process.env.PERPLEXITY_API_KEY;

const BATCH_SIZE = 10; // steps generation is light → 10 per batch OK
const WAIT = (ms) => new Promise((r) => setTimeout(r, ms));

/**************************************************************
 *  PROMPT FOR STEPS ONLY (VERY SMALL → LOW TOKENS)
 **************************************************************/
function buildPrompt(universities) {
  return `
Return STRICT JSON ARRAY ONLY.

For EACH university, generate ONLY 3 steps in format:

{
  "id": "",
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
 *  CALL PERPLEXITY
 **************************************************************/
async function generateStepsBatch(input) {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        temperature: 0.1,
        messages: [
          { role: "system", content: "Respond ONLY with pure JSON." },
          { role: "user", content: buildPrompt(input) },
        ],
      }),
    });

    const raw = await res.text();
    if (raw.startsWith("<")) throw new Error("HTML response (rate limit)");

    const json = JSON.parse(raw);
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    return JSON.parse(content);
  } catch (err) {
    console.log("❌ Steps Batch Error:", err.message);
    return null;
  }
}

/**************************************************************
 *  MAIN SCRIPT
 **************************************************************/
(async () => {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("Connected to MongoDB");

  // 🔍 Find only universities missing STEPS
  const pending = await Universities.find({
    generatedProgram: { $exists: true },
    $or: [
      { "generatedProgram.steps": { $exists: false } },
      { "generatedProgram.steps": { $size: 0 } },
    ],
  })
    .lean()
    .exec();

  console.log("Pending universities:", pending.length);

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    console.log(`\nProcessing batch ${i / BATCH_SIZE + 1}...`);

    const batch = pending.slice(i, i + BATCH_SIZE).map((u) => ({
      id: u._id,
      school: u.name,
      program: u.generatedProgram?.program,
    }));

    const result = await generateStepsBatch(batch);

    if (!result) {
      console.log("⚠️ Retry in 5 seconds...");
      await WAIT(5000);
      i -= BATCH_SIZE;
      continue;
    }

    for (const uni of result) {
      if (!uni.id) continue;

      const steps = uni.steps.map((s) => ({
        _id: new ObjectId(),
        name: s.name,
        description: s.description,
      }));

      await Universities.updateOne(
        { _id: uni.id },
        {
          $set: {
            "generatedProgram.steps": steps,
            "generatedProgram.generatedAt": new Date(),
          },
        }
      );
    }

    console.log("⏳ Waiting 4 seconds...");
    await WAIT(4000);
  }

  console.log("🎉 STEPS GENERATION COMPLETE!");
  process.exit(0);
})();
