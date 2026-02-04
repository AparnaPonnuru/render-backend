// controllers/universities.controller.js
const universitiesModel = require("../models/universities.model");
const axios = require("axios");
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// helper wait function
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ===========================
   1️⃣  SEED UNIVERSITIES (College Scorecard)
=========================== */
const addUniversities = async (req, res) => {
  try {
    console.log("🇺🇸 Starting U.S. universities seeding...");

    const API_KEY = process.env.COLLEGE_SCORECARD_KEY;
    if (!API_KEY) {
      return res.status(400).json({
        status: false,
        message: "Missing COLLEGE_SCORECARD_KEY in environment variables",
      });
    }

    const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools.json";
    const perPage = 100;
    const singleState = req.query.state;

    const allStates = [
      "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
      "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
      "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
      "VA","WA","WV","WI","WY"
    ];

    const states = singleState ? [singleState] : allStates;
    const result = [];

    for (const st of states) {
      console.log(`\n🔎 Processing state: ${st}`);
      let page = 0;

      while (true) {
        const url =
          `${BASE_URL}?api_key=${API_KEY}` +
          `&school.state=${st}` +
          `&per_page=${perPage}&page=${page}` +
          `&fields=id,school.name,school.state,school.school_url`;

        let data = null;

        try {
          const response = await axios.get(url);
          data = response.data;
        } catch (err) {
          console.log("❌ Error fetching:", url, err.message || "");
          break;
        }

        if (!data?.results?.length) break;

        const mapped = data.results.map((u) => {
          let site = u["school.school_url"];
          let domain = null;

          if (site && !/^https?:\/\//i.test(site)) {
            site = `https://${site}`;
          }

          try {
            const parsed = new URL(site);
            domain = parsed.hostname;
          } catch {}

          return {
            name: u["school.name"],
            country: "United States",
            alpha_two_code: "US",
            "state-province": u["school.state"],
            web_pages: site ? [site] : [],
            domains: domain ? [domain] : [],
          };
        });

        result.push(...mapped);
        page++;
        await wait(200);
      }
    }

    console.log(`\n🎉 Total U.S. universities collected: ${result.length}`);

    console.log("🧹 Deleting old U.S. universities from DB...");
    await universitiesModel.deleteMany({ country: { $regex: /^united states/i } });

    if (result.length > 0) {
      console.log("💾 Inserting new universities (bulk)...");
      await universitiesModel.insertMany(result, { ordered: false });
    }

    console.log("✅ Seeding complete.");
    return res.json({
      status: true,
      message: "Universities seeded successfully",
      total: result.length,
    });

  } catch (err) {
    console.error("addUniversities error:", err);
    return res.status(500).json({
      status: false,
      message: "Error fetching or saving U.S. universities",
      error: err.message || String(err),
    });
  }
};

/* ===========================
   2️⃣  FETCH UNIVERSITIES
=========================== */
const fetchUniversities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.state) filter["state-province"] = req.query.state;
    if (req.query.name) filter.name = new RegExp(req.query.name, "i");

    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "5000", 10), 5000);
    const skip = (page - 1) * limit;

    const [universities, total] = await Promise.all([
      universitiesModel.find(filter).skip(skip).limit(limit),
      universitiesModel.countDocuments(filter),
    ]);

    return res.json({
      status: true,
      message: "U.S. universities fetched",
      total,
      page,
      limit,
      data: universities,
    });

  } catch (err) {
    console.error("fetchUniversities error:", err);
    return res.status(500).json({
      status: false,
      message: "Error fetching universities",
      error: err.message,
    });
  }
};

/* ===========================
   3️⃣  AI PROGRAM GENERATOR — GROQ VERSION
=========================== */
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
      model: "llama-3.1-8b-instant",   // ✅ FIXED MODEL
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 200,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(raw);

  } catch (err) {
    console.error("AI generation error:", err.message);
    return {
      program: "Program Not Available",
      description: "AI generation failed.",
    };
  }
}


/* ===========================
   4️⃣  FORMATTED UNIVERSITIES WITH AI (cached)
=========================== */
const fetchFormattedUniversities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.state) filter["state-province"] = req.query.state;
    if (req.query.country) filter.country = req.query.country;

    // ✔ Allow up to 5000 instead of 200
    const limit = Math.min(parseInt(req.query.limit || "5000", 10), 5000);

    const universities = await universitiesModel.find(filter).limit(limit);
    const formatted = [];

    for (const uni of universities) {
      let aiData = uni.generatedProgram;

      if (!aiData) {
        aiData = await generateProgram(uni.name);

        await universitiesModel.updateOne(
          { _id: uni._id },
          { $set: { generatedProgram: { ...aiData, generatedAt: new Date() } } }
        );
      }

      formatted.push({
        school: uni.name,
        program: aiData.program,
        description: aiData.description,
        website: uni.web_pages?.[0] || null,
        state: uni["state-province"],
      });
    }

    return res.json({
      status: true,
      total: formatted.length,
      data: formatted,
    });

  } catch (err) {
    console.error("fetchFormattedUniversities error:", err);
    return res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};


const getEnrichedUniversities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "100", 10);
    const data = await Universities.find().limit(limit);

    const formatted = data.map((u) => ({
      school: u.name,
      country: u.country,
      program: u.generatedProgram?.program,
      description: u.generatedProgram?.description,

      grade: u.generatedProgram?.grade,
      curriculum: u.generatedProgram?.curriculum,
      stream: u.generatedProgram?.stream,
      performance: u.generatedProgram?.performance,
      financialSituation: u.generatedProgram?.financialSituation,
      personality: u.generatedProgram?.personality,

      steps: u.generatedProgram?.steps || []
    }));

    return res.json({
      status: true,
      total: formatted.length,
      data: formatted
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};




module.exports = {
  addUniversities,
  fetchUniversities,
  fetchFormattedUniversities,
  getEnrichedUniversities
};
