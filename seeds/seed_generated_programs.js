require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/universities.model");
const Groq = require("groq-sdk");

// Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// helper wait
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function generateProgram(universityName) {
  const prompt = `
Generate ONE realistic academic program for: "${universityName}".
Respond ONLY in pure JSON:
{
  "program": "...",
  "description": "1–2 sentence marketing-friendly description"
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",


      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 150,
    });

    let raw = completion.choices[0].message.content.trim();

    // remove accidental markdown
    raw = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(raw);
  } catch (err) {
    console.log("AI error:", err.message);
    return {
      program: "Program Not Available",
      description: "AI generation failed.",
    };
  }
}

(async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.DATABASE_URI);

  const universities = await Universities.find();

  console.log(`Found ${universities.length} universities. Starting generation...`);

  let count = 0;

  for (const uni of universities) {
    const gp = uni.generatedProgram;

    // Only skip when real valid data exists
    const hasValidProgram =
      gp &&
      gp.program &&
      gp.program !== "Program Not Available" &&
      gp.program !== "AI generation failed." &&
      gp.description &&
      gp.description.trim() !== "";

    if (hasValidProgram) {
      console.log(`Skipping (already generated): ${uni.name}`);
      continue;
    }

    console.log(`Generating for: ${uni.name}`);

    const ai = await generateProgram(uni.name);

    await Universities.updateOne(
      { _id: uni._id },
      {
        $set: {
          generatedProgram: {
            program: ai.program,
            description: ai.description,
            generatedAt: new Date(),
          },
        },
      }
    );

    console.log(`Saved generated program for: ${uni.name}`);
    count++;

    await wait(200); // polite delay
  }

  console.log(`\nDONE — Programs generated for ${count} universities.`);
  process.exit(0);
})();
